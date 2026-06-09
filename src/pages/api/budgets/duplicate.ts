import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

/**
 * GET  /api/budgets/duplicate  → preview what would be copied (no DB changes)
 * POST /api/budgets/duplicate  → copy BudgetHistoric from the previous calendar month
 *                                 into Budget, skipping categories that already exist.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    // Previous calendar month range (server time)
    const now = new Date()
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

    const historics = await prisma.budgetHistoric.findMany({
      where: {
        date: { gte: prevMonthStart, lte: prevMonthEnd },
        category: { not: 'Ingresos fijos' }
      }
    })

    if (historics.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron presupuestos del mes anterior para duplicar.'
      })
    }

    // Aggregate by category — take the highest amount when there are multiple records
    const byCategory = new Map<string, number>()
    historics.forEach(h => {
      byCategory.set(h.category, Math.max(byCategory.get(h.category) ?? 0, h.amount))
    })

    // Fetch categories that already have an active Budget
    const existing = await prisma.budget.findMany({ select: { category: true } })
    const existingSet = new Set(existing.map(b => b.category))

    const items = Array.from(byCategory.entries()).map(([category, amount]) => ({
      category,
      amount,
      /** true → already has a Budget; will be skipped on POST */
      exists: existingSet.has(category)
    }))

    // Sort: new ones first, existing (skipped) last
    items.sort((a, b) => Number(a.exists) - Number(b.exists) || a.category.localeCompare(b.category))

    if (req.method === 'GET') {
      // Preview only — no writes
      return res.status(200).json({ items })
    }

    // POST — perform the copy
    const toCreate = items.filter(i => !i.exists)

    for (const item of toCreate) {
      await prisma.budget.create({ data: { category: item.category, amount: item.amount } })
    }

    return res.status(200).json({
      created: toCreate.length,
      skipped: items.filter(i => i.exists).map(i => i.category),
      message: `${toCreate.length} presupuesto${toCreate.length !== 1 ? 's' : ''} copiado${toCreate.length !== 1 ? 's' : ''} correctamente.`
    })
  } catch (error) {
    console.error('Failed to duplicate budgets:', error)
    return res.status(500).json({ error: 'Error al duplicar presupuestos.' })
  }
}

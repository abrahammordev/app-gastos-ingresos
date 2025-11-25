import prisma from '@/lib/prisma'
import { IBudgetHistoric } from '@/types/index'
import { parseDate, parseIntSafe } from '@/utils/utils'
import { NextApiRequest, NextApiResponse } from 'next'

// pages/api/budget_historics/index.js
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        // Retrieve transactions from the database
        const { startDate, endDate, page, limit, sortBy, sortOrder, excludeCategory, filters } = req.query

        const parsedStartDate = parseDate(startDate as string)
        const parsedEndDate = parseDate(endDate as string)
        const parsedPage = parseIntSafe(page as string)
        const parsedLimit = parseIntSafe(limit as string)
        const filtersJson = filters && filters !== '{}' ? JSON.parse(filters as string) : undefined

        const whereCondition = {
          date: {
            gte: parsedStartDate,
            lte: parsedEndDate
          },
          // Añadir la condición para excluir categorías si está presente
          ...(excludeCategory && {
            category: {
              not: Array.isArray(excludeCategory) ? { in: excludeCategory as string[] } : (excludeCategory as string)
            }
          }),
          // Añadir la condición para filtrar por categoría, cantidad y fecha si está presente
          ...(filtersJson && {
            category: filtersJson.category ? { contains: filtersJson.category, mode: 'insensitive' as const} : undefined
          })
        }

        const paginationOptions = {
          skip: parsedPage ? (parsedPage - 1) * (parsedLimit ?? 0) : undefined,
          take: parsedLimit,
          orderBy: sortBy
            ? {
                [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc'
              }
            : undefined
        }

        const totalItems = await prisma.budgetHistoric.count({ where: whereCondition })
        const totalAmount = await prisma.budgetHistoric.aggregate({
          _sum: {
            amount: true
          }
        })

        const budgetHistorics: IBudgetHistoric[] = await prisma.budgetHistoric.findMany({
          where: whereCondition,
          ...paginationOptions
        })

        res.status(200).json({ totalItems, totalAmount: totalAmount._sum.amount, budgetHistorics })
      } catch (error) {
        console.error('Failed to retrieve budget historics:', error)
        res.status(500).json({ error: 'Failed to retrieve budget historics' })
      }
      break

    case 'POST':
      try {
        // Verify if the request body is an array or a single object
        const budgetHistoricsInput = Array.isArray(req.body) ? req.body : [req.body]

        // Map incoming budget_historics details to the format expected by the Prisma createMany
        const budgetHistoricData = budgetHistoricsInput.map(historic => ({
          amount: historic.amount,
          category: historic.category,
          date: historic.date
        }))

        // Use Prisma's createMany to insert multiple budget_historics
        const newBudgetHistorics = await prisma.budgetHistoric.createMany({
          data: budgetHistoricData
        })

        res.status(201).json(newBudgetHistorics)
      } catch (error) {
        console.error('Failed to create budget historic:', error)
        res.status(400).json({ error: 'Failed to create budget historic' })
      }
      break

    // case delete by category
    case 'DELETE':
      try {
        const { category } = req.body

        // Use Prisma's deleteMany to delete budgets historic by category
        await prisma.budgetHistoric.deleteMany({
          where: {
            category
          }
        })

        res.status(204).end()
      } catch (error) {
        console.error('Failed to delete budgets:', error)
        res.status(400).json({ error: 'Failed to delete budgets' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

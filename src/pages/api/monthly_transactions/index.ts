import prisma from '@/lib/prisma'
import { parseIntSafe } from '@/utils/utils'
import { NextApiRequest, NextApiResponse } from 'next'

// pages/api/monthly_transactions/index.js
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { type, page, limit, sortBy, sortOrder, filters } = req.query

        const parsedPage = parseIntSafe(page as string)
        const parsedLimit = parseIntSafe(limit as string)
        const filtersJson = filters && filters !== '{}' ? JSON.parse(filters as string) : undefined

        const paginationOptions = {
          skip: parsedPage && parsedLimit ? (parsedPage - 1) * parsedLimit : undefined,
          take: parsedLimit,
          orderBy: sortBy
            ? {
                [sortBy as string]: sortOrder === 'asc' ? 'asc' : sortOrder === 'desc' ? 'desc' : 'asc' // Default to ascending if sortOrder is incorrect
              }
            : undefined
        }

        const filterOptions = {
          where: {
            amount: type === 'expense' ? { lt: 0 } : type === 'income' ? { gt: 0 } : undefined,
            ...(filtersJson && {
              title: filtersJson.title ? { contains: filtersJson.title, mode: 'insensitive' as const} : undefined,
              category: filtersJson.category ? { contains: filtersJson.category, mode: 'insensitive' as const} : undefined
            })
          }
        }

        // Fetching the total number of monthly transactions
        const totalItems = await prisma.monthlyTransaction.count({
          ...filterOptions
        })

        const totalAmount = await prisma.monthlyTransaction.aggregate({
          _sum: {
            amount: true
          }
        })

        // Fetching monthly transactions with pagination and sorting options
        const monthlyTransactions = await prisma.monthlyTransaction.findMany({
          ...paginationOptions,
          ...filterOptions
        })

        res.status(200).json({ totalItems, totalAmount: totalAmount._sum.amount, monthlyTransactions })
      } catch (error) {
        console.error('Failed to retrieve monthly_transactions:', error)
        res.status(500).json({ error: 'Failed to retrieve monthly_transactions' })
      }
      break

    case 'POST':
      try {
        // Extract monthly transaction details from request body
        const { title, amount, category } = req.body

        // Create a new monthly transaction in the database
        const newMonthlyTransaction = await prisma.monthlyTransaction.create({
          data: {
            amount,
            title,
            category,
            type: amount < 0 ? 'EXPENSE' : 'INCOME'
          }
        })

        res.status(201).json(newMonthlyTransaction)
      } catch (error) {
        console.error('Failed to create monthly transaction:', error)
        res.status(400).json({ error: 'Failed to create monthly transaction' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

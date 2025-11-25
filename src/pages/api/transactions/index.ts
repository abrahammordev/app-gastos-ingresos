import { ITransaction } from '@/types/index'
import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { parseDate, parseIntSafe } from '@/utils/utils'

// pages/api/transactions/index.js
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        // Retrieve transactions from the database
        const { startDate, endDate, type, page, limit, sortBy, sortOrder, filters } = req.query

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
          amount: type === 'expense' ? { lt: 0 } : type === 'income' ? { gt: 0 } : undefined,
          ...(filtersJson && {
            title: filtersJson.title ? { contains: filtersJson.title, mode: 'insensitive' as const} : undefined,
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

        const totalItems = await prisma.transaction.count({ where: whereCondition })

        const totalAmount = await prisma.transaction.aggregate({
          _sum: {
            amount: true
          }
        })

        const transactions: ITransaction[] = await prisma.transaction.findMany({
          where: whereCondition,
          ...paginationOptions
        })

        res.status(200).json({ totalItems, totalAmount: totalAmount._sum.amount, transactions })
      } catch (error) {
        console.error('Failed to retrieve transactions:', error)
        res.status(500).json({ error: 'Failed to retrieve transactions' })
      }
      break

    case 'POST':
      try {
        // Verify if the request body is an array or a single object
        const transactionsInput = Array.isArray(req.body) ? req.body : [req.body]

        // Use a loop to create each transaction and collect them
        const createdTransactions = []
        for (const transaction of transactionsInput) {
          const newTransaction = await prisma.transaction.create({
            data: {
              title: transaction.title,
              amount: transaction.amount,
              date: transaction.date,
              category: transaction.category,
              type: transaction.amount < 0 ? 'EXPENSE' : 'INCOME'
            }
          })
          createdTransactions.push(newTransaction)
        }

        // Respond with the array of created transactions
        res.status(201).json(createdTransactions)
      } catch (error) {
        console.error('Failed to create transaction:', error)
        res.status(400).json({ error: 'Failed to create transaction' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

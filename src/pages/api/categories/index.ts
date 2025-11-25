import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

// pages/api/categories/index.js
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const {  sortBy, sortOrder, excludeCategory, filters } = req.query

        const filtersJson = filters && filters !== '{}' ? JSON.parse(filters as string) : undefined

        const orderOptions = {
          orderBy: sortBy
            ? {
                [sortBy as string]: sortOrder === 'asc' ? 'asc' : sortOrder === 'desc' ? 'desc' : 'asc' // Default to ascending if sortOrder is incorrect
              }
            : undefined
        }

        // Definir el filtro de exclusión de categoría
        const filterOptions = {
            where: {
              ...(excludeCategory && {
                id: {
                  not: Array.isArray(excludeCategory) ? { in: excludeCategory as string[] } : (excludeCategory as string)
                }
              }),
              ...(filtersJson && {
                id: filtersJson.id ? { contains: filtersJson.id, mode: 'insensitive' as const } : undefined,
              })
            }
          }

        // Fetching the total number of monthly transactions
        const totalItems = await prisma.category.count({
          ...filterOptions
        })

        // Fetching monthly transactions with pagination and sorting options
        const categories = await prisma.category.findMany({
          ...orderOptions,
          ...filterOptions
        })

        res.status(200).json({ totalItems, categories })
      } catch (error) {
        console.error('Failed to retrieve categories:', error)
        res.status(500).json({ error: 'Failed to retrieve categories' })
      }
      break

    case 'POST':
      try {
        // Verify if the request body is an array or a single object
        const categoriesInput = Array.isArray(req.body) ? req.body : [req.body]

        // Use a loop to create each category and collect them
        const createdCategories = []
        for (const category of categoriesInput) {
          const newCategory = await prisma.category.create({
            data: {
              id: category.category,
              deleted: category.deleted
            }
          })
          createdCategories.push(newCategory)
        }

        // Respond with the array of created categories
        res.status(201).json(createdCategories)
      } catch (error) {
        console.error('Failed to create categories:', error)
        res.status(400).json({ error: 'Failed to create categories' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

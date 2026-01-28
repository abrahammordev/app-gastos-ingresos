
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    let settings = await prisma.appSettings.findFirst()
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          startDayOfMonth: 1,
          darkMode: false
        }
      })
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { startDayOfMonth, darkMode } = await request.json()

    // Validate startDayOfMonth if provided
    if (startDayOfMonth !== undefined && (startDayOfMonth < 1 || startDayOfMonth > 28)) {
       return NextResponse.json({ error: 'Invalid start day. Must be between 1 and 28.' }, { status: 400 })
    }

    let settings = await prisma.appSettings.findFirst()
    const updateData: { startDayOfMonth?: number; darkMode?: boolean } = {}

    if (startDayOfMonth !== undefined) {
      updateData.startDayOfMonth = startDayOfMonth
    }
    if (darkMode !== undefined) {
      updateData.darkMode = darkMode
    }

    if (settings) {
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: updateData
      })
    } else {
      settings = await prisma.appSettings.create({
        data: {
          startDayOfMonth: startDayOfMonth ?? 1,
          darkMode: darkMode ?? false
        }
      })
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
  }
}

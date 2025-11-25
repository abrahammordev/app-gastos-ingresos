
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    let settings = await prisma.appSettings.findFirst()
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          startDayOfMonth: 1
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
    const { startDayOfMonth } = await request.json()
    
    // Validate input
    if (startDayOfMonth < 1 || startDayOfMonth > 28) {
       return NextResponse.json({ error: 'Invalid start day. Must be between 1 and 28.' }, { status: 400 })
    }

    let settings = await prisma.appSettings.findFirst()
    if (settings) {
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: { startDayOfMonth }
      })
    } else {
      settings = await prisma.appSettings.create({
        data: { startDayOfMonth }
      })
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
  }
}


import { useState, useEffect } from 'react'
import customFetch from '@/utils/fetchWrapper'

export interface AppSettings {
    id: number
    startDayOfMonth: number
}

export default function useAppSettings() {
    const [settings, setSettings] = useState<AppSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<unknown>(null)

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const response = await customFetch('/api/settings')
            if (response.ok) {
                const data = await response.json()
                setSettings(data)
            } else {
                throw new Error('Failed to fetch settings')
            }
        } catch (err) {
            setError(err)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        try {
            const response = await customFetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSettings)
            })
            if (response.ok) {
                const data = await response.json()
                setSettings(data)
                return data
            } else {
                throw new Error('Failed to update settings')
            }
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    return { settings, loading, error, updateSettings, fetchSettings }
}

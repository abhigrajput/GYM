"use client"

import { useEffect, useMemo, useState } from "react"

export function useOfflineWorkout(memberId: string, workout?: any) {
  const date = new Date().toISOString().slice(0, 10)
  const cacheKey = useMemo(() => `ironiq_offline_workout_${memberId}_${date}`, [date, memberId])
  const [cachedWorkout, setCachedWorkout] = useState<any>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  const saveToCache = (value: any) => {
    localStorage.setItem(cacheKey, JSON.stringify(value))
    setCachedWorkout(value)
    setIsFromCache(true)
  }

  const clearCache = () => {
    localStorage.removeItem(cacheKey)
    setCachedWorkout(null)
    setIsFromCache(false)
  }

  useEffect(() => {
    const raw = localStorage.getItem(cacheKey)
    if (raw) {
      setCachedWorkout(JSON.parse(raw))
      setIsFromCache(true)
    }
  }, [cacheKey])

  useEffect(() => {
    if (workout) {
      localStorage.setItem(cacheKey, JSON.stringify(workout))
      setCachedWorkout(workout)
      setIsFromCache(false)
    }
  }, [cacheKey, workout])

  return { cachedWorkout, saveToCache, clearCache, isFromCache }
}

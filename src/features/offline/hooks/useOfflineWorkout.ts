"use client"

import { useEffect, useMemo, useState } from "react"

export function useOfflineWorkout(memberId: string, workout?: any) {
  const date = new Date().toISOString().slice(0, 10)
  const cacheKey = useMemo(() => `ironiq_offline_workout_${memberId}_${date}`, [date, memberId])
  const pendingLogsKey = useMemo(() => `ironiq_pending_logs_${memberId}`, [memberId])
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

  const syncPendingWorkoutLogs = async () => {
    if (typeof window === "undefined" || !navigator.onLine) return
    const raw = localStorage.getItem(pendingLogsKey)
    if (!raw) return
    const queue = JSON.parse(raw) as unknown[]
    if (!Array.isArray(queue) || queue.length === 0) return
    for (const item of queue) {
      await fetch("/api/workout-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })
    }
    localStorage.removeItem(pendingLogsKey)
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

  useEffect(() => {
    const onOnline = () => {
      void syncPendingWorkoutLogs()
    }
    window.addEventListener("online", onOnline)
    void syncPendingWorkoutLogs()
    return () => window.removeEventListener("online", onOnline)
  }, [pendingLogsKey])

  return { cachedWorkout, saveToCache, clearCache, isFromCache, syncPendingWorkoutLogs }
}

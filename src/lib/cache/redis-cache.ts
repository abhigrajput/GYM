type Entry<T> = { value: T; expiresAt: number }

const MAX_ENTRIES = 500

class LRUCache<T> {
  private map = new Map<string, Entry<T>>()

  get(key: string): T | undefined {
    const e = this.map.get(key)
    if (!e) return undefined
    if (Date.now() > e.expiresAt) {
      this.map.delete(key)
      return undefined
    }
    this.map.delete(key)
    this.map.set(key, e)
    return e.value
  }

  set(key: string, value: T, ttlMs: number) {
    if (this.map.has(key)) this.map.delete(key)
    this.map.set(key, { value, expiresAt: Date.now() + ttlMs })
    while (this.map.size > MAX_ENTRIES) {
      const first = this.map.keys().next().value as string | undefined
      if (first === undefined) break
      this.map.delete(first)
    }
  }

  delete(key: string) {
    this.map.delete(key)
  }
}

const equipmentCache = new LRUCache<unknown>()
const leaderboardCache = new LRUCache<unknown>()
const gymStatsCache = new LRUCache<unknown>()

export function cacheEquipmentList<T>(gymId: string, factory: () => T): T {
  const key = `equipment:${gymId}`
  const hit = equipmentCache.get(key) as T | undefined
  if (hit !== undefined) return hit
  const value = factory()
  equipmentCache.set(key, value, 5 * 60 * 1000)
  return value
}

export function invalidateEquipmentCache(gymId: string) {
  equipmentCache.delete(`equipment:${gymId}`)
}

export function cacheLeaderboard<T>(gymId: string, factory: () => T): T {
  const key = `leaderboard:${gymId}`
  const hit = leaderboardCache.get(key) as T | undefined
  if (hit !== undefined) return hit
  const value = factory()
  leaderboardCache.set(key, value, 60 * 1000)
  return value
}

export function cacheGymStats<T>(key: string, factory: () => T): T {
  const fullKey = `gymstats:${key}`
  const hit = gymStatsCache.get(fullKey) as T | undefined
  if (hit !== undefined) return hit
  const value = factory()
  gymStatsCache.set(fullKey, value, 2 * 60 * 1000)
  return value
}

import type Redis from 'ioredis'

interface Entry {
  value: Buffer
  expiresAt: number
}

const makeMemoryRedis = () => {
  const store = new Map<string, Entry>()
  const read = (key: string) => {
    const entry = store.get(key)
    if (!entry) return null
    if (entry.expiresAt > Date.now()) return entry.value
    store.delete(key)
    return null
  }
  const write = (key: string, value: Buffer, ttlMs: number) => {
    store.set(key, {value, expiresAt: Date.now() + ttlMs})
  }
  const redis = {
    setBuffer: async (key: string, value: Buffer, _px: 'PX', ttlMs: number) => {
      const prev = read(key)
      if (prev === null) write(key, value, ttlMs)
      return prev
    },
    getBuffer: async (key: string) => read(key),
    set: async (key: string, value: Buffer, _px: 'PX', ttlMs: number) => {
      write(key, value, ttlMs)
      return 'OK'
    },
    del: async (key: string) => (store.delete(key) ? 1 : 0)
  }
  return {redis: redis as unknown as Redis, keys: () => [...store.keys()]}
}

export default makeMemoryRedis

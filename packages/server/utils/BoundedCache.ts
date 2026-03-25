export class BoundedCache<K, V> {
  private readonly map = new Map<K, V>()
  constructor(private readonly maxSize: number) {}
  get(key: K) {
    return this.map.get(key)
  }
  set(key: K, value: V) {
    if (this.map.size >= this.maxSize && !this.map.has(key)) {
      this.map.delete(this.map.keys().next().value as K)
    }
    this.map.set(key, value)
  }
  delete(key: K) {
    this.map.delete(key)
  }
  clear() {
    this.map.clear()
  }
}

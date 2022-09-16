import {RecordProxy, Variables} from 'relay-runtime'

type Unproxy<T> = T extends RecordProxy<infer U> ? U : T
// type UndefinedIfNull<T> = null extends T ? undefined : never
type NullIfNull<T> = null extends T ? null : never

class SafeProxy<
  T extends RecordProxy<any>,
  U extends Unproxy<T> = Unproxy<T>,
  V extends NonNullable<U> = NonNullable<U>
> {
  proxy: RecordProxy<any> | null

  constructor(proxy: T | null) {
    this.proxy = proxy
  }

  getValue<K extends keyof V>(name: K, args?: Variables): NullIfNull<U> | NullIfNull<V[K]> | V[K] {
    // help wanted: how to remove the cast?
    if (!this.proxy) return null!
    return this.proxy.getValue(name as any, args)
  }

  getLinkedRecord<K extends keyof V>(name: K, args?: Variables): SafeProxy<RecordProxy<V[K]>> {
    const proxy = this.proxy ? this.proxy.getLinkedRecord(name as any, args) : null
    return new SafeProxy(proxy)
  }

  getLinkedRecords<K extends keyof V>(
    name: K,
    args?: Variables
  ): SafeProxy<RecordProxy<V[K]>>[] | SafeProxy<RecordProxy<V[K]>> {
    const records = this.proxy ? this.proxy.getLinkedRecords(name as any, args) : null
    return records ? records.map((record) => new SafeProxy(record)) : new SafeProxy(null)
  }
}

const safeProxy = <T extends RecordProxy<any>>(proxy: T | null) => new SafeProxy(proxy)

export default safeProxy

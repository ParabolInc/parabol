export const PageId = {
  join: (id: number) => `page:${(id >>> 0).toString()}`,
  split: (id: string): number => Number(id.split(':')[1]) | 0,
  /** Signed DB id → unsigned page code (for URLs, YDoc attrs, storage paths) */
  code: (dbId: number): number => dbId >>> 0,
  /** Unsigned page code → signed DB id */
  dbId: (code: number): number => code | 0
}

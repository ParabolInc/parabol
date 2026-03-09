export const PageId = {
  join: (id: number) => `page:${(id >>> 0).toString()}`,
  split: (id: string): number => Number(id.split(':')[1]) | 0,
  // Keep client visible ids unsigned
  toClient: (dbId: number): number => dbId >>> 0,
  // The DB can have signed ids
  fromClient: (code: number): number => code | 0
}

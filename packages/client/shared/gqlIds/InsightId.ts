export const InsightId = {
  join: (ownerId: string, databaseId: number) => `insight:${ownerId}:${databaseId}`,
  split: (id: string) => {
    const [, ownerId, databaseId] = id.split(':')
    return {ownerId, databaseId}
  }
}

export const InsightId = {
  join: (ownerId: string, databaseId: string) => `insight:${ownerId}:${databaseId}`,
  split: (id: string) => {
    const [, ownerId, databaseId] = id.split(':')
    return {ownerId, databaseId}
  }
}

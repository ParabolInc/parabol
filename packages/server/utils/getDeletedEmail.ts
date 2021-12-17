const getDeletedEmail = (userId: string) => `DELETED:${userId}:${Date.now()}`
export default getDeletedEmail

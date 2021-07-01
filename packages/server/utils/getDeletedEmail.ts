const getDeletedEmail = (userId) => `DELETED:${userId}:${Date.now()}`
export default getDeletedEmail

export const getGlobalConfig = () => ({
  provider: process.env.MAIL_PROVIDER || null,
  from: process.env.MAIL_FROM || '',
  maxBatchSize: process.env.MAX_BATCH_SIZE || 1000
})


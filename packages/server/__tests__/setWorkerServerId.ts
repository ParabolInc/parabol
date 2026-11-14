// generateUID embeds SERVER_ID, so a worker sharing one with another worker or the server under test mints duplicate ids
const WORKER_SERVER_ID_OFFSET = 100
process.env.SERVER_ID = String(WORKER_SERVER_ID_OFFSET + Number(process.env.JEST_WORKER_ID))

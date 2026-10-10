import pg from 'pg'

const connectToPostgres = async (database = process.env.POSTGRES_DB) => {
  const {POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT} = process.env
  const client = new pg.Client({
    database,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    host: POSTGRES_HOST,
    port: Number(POSTGRES_PORT)
  })
  await client.connect()
  return client
}

export default connectToPostgres

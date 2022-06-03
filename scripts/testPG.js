require('./webpack/utils/dotenv')
const {Client} = require('pg')

const main = async () => {
  const pgConfig = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    max: 5
  }
  const client = new Client(pgConfig)
  await client.connect()
  const res1 = await client.query(`SELECT 1`)
  console.log(res1.rows[0])
  await client.end()
}

main()

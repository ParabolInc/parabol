import PROD from '../PROD'

const getPgConfig = () => ({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  max: Number(process.env.POSTGRES_POOL_SIZE) || PROD ? 20 : 5
})

export default getPgConfig

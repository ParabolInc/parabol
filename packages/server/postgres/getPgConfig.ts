import PROD from '../PROD'
// @ts-ignore
import getPgSSL from './getPgSSL'

const getPgConfig = () => {
  const config = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    max: Number(process.env.POSTGRES_POOL_SIZE) || PROD ? 20 : 5
  }
  const ssl = getPgSSL()
  // ssl value defaults to process.env.PGSSLMODE, so only set the variable here if CA is found
  if (!ssl) return config
  return {...config, ssl}
}

export default getPgConfig

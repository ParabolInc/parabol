// @ts-ignore
import getPgSSL from './getPgSSL'

const getPgConfig = () => {
  const config = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    // this is used outside of webpack transpiled scripts, so checking NODE_ENV is required
    max: Number(process.env.POSTGRES_POOL_SIZE) || process.env.NODE_ENV === 'production' ? 20 : 5
  }
  const ssl = getPgSSL()
  if (!ssl) return config
  return {...config, ssl}
}

export default getPgConfig

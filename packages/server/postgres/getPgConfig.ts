import PROD from '../PROD'

const getPgConfig = () => {
  const config = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    max: PROD ? 85 : 5 // leave 15 conns for su management in production
  }
  return config
}

export default getPgConfig

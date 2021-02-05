import PROD from '../PROD'
import readCert from './readCert'

const getPgConfig = () => {
  const config = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    max: PROD ? 85 : 5 // leave 15 conns for su management in production
  }
  if (PROD && process.env.PGSSLMODE === 'require') {
    Object.assign(config, {
      ssl: {
        rejectUnauthorized: true,
        ca: readCert()
      }
    })
  }
  return config
}

export default getPgConfig

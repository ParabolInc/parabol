import getServerIdFromIP from './utils/getServerIdFromIP'

const {SERVER_ID, POD_IP} = process.env

if (!SERVER_ID && POD_IP) {
  process.env.SERVER_ID = String(getServerIdFromIP(POD_IP))
}

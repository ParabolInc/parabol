import {isIPv4} from 'node:net'

const SERVER_ID_BIT_LEN = 10

const getServerIdFromIP = (ip: string) => {
  if (!isIPv4(ip)) throw new Error(`Cannot derive SERVER_ID from invalid IPv4 address: ${ip}`)
  const octets = ip.split('.').map(Number)
  return ((octets[2]! << 8) | octets[3]!) & (2 ** SERVER_ID_BIT_LEN - 1)
}

export default getServerIdFromIP

import ms from 'ms'

const LONG_OPEN_MONTHS = 6

const getLongOpenMonths = (createdAt: string, now = Date.now()) => {
  const months = Math.floor((now - new Date(createdAt).getTime()) / ms('30d'))
  return months >= LONG_OPEN_MONTHS ? months : null
}

export default getLongOpenMonths

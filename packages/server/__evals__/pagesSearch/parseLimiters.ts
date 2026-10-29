const POSITIVE_INTEGER = /^[1-9]\d*$/

export interface Limiter {
  token: string
  vectorOnlyLimit?: number
}

const parseLimiter = (token: string): Limiter | undefined => {
  if (token === 'off') return {token}
  const [kind, value = ''] = token.split(':')
  if (kind === 'cap' && POSITIVE_INTEGER.test(value)) return {token, vectorOnlyLimit: Number(value)}
  return undefined
}

const parseLimiters = (name: string, value: string) => {
  const limiters = value.split(',').map((item) => {
    const limiter = parseLimiter(item.trim())
    if (!limiter) {
      throw new Error(`${name} must list off or cap:<positive integer>, got "${value}"`)
    }
    return limiter
  })
  const tokens = limiters.map(({token}) => token)
  const duplicate = tokens.find((token, i) => tokens.indexOf(token) !== i)
  if (duplicate !== undefined) throw new Error(`${name} lists ${duplicate} more than once`)
  return limiters
}

export default parseLimiters

export interface AuthToken {
  sub: string
  tms: string[]
  rol?: 'su' | 'impersonate' | null
  bet?: 1
  iat: number
  iss: string
  exp: number
  aud: string
}

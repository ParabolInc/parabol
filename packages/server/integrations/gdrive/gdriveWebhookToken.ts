import {createHmac, timingSafeEqual} from 'crypto'
import getKysely from '../../postgres/getKysely'

type TokenPayload = {
  userId: string
  teamId: string
  folderId: string
}

const secret = () => Buffer.from(process.env.SERVER_SECRET!, 'base64')
export const handleRotatedServerSecret = async () => {
  const pg = getKysely()
  await pg.deleteFrom('TeamMemberIntegrationAuth').where('service', '=', 'gdrive').execute()
}

const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url')

export const signGdriveToken = (payload: TokenPayload) => {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${data}.${sign(data)}`
}

export const verifyGdriveToken = (token: string): TokenPayload | null => {
  const dot = token.lastIndexOf('.')
  if (dot === -1) return null
  const data = token.slice(0, dot)
  const actual = Buffer.from(token.slice(dot + 1))
  const expected = Buffer.from(sign(data))
  const verified = expected.length === actual.length && timingSafeEqual(expected, actual)
  if (!verified) return null
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString()) as TokenPayload
  } catch {
    return null
  }
}

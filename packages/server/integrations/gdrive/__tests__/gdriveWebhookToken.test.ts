import {createHmac} from 'crypto'
import {signGdriveToken, verifyGdriveToken} from '../gdriveWebhookToken'

describe('gdriveWebhookToken', () => {
  const originalEnv = process.env
  beforeAll(() => {
    process.env = {...originalEnv, SERVER_SECRET: Buffer.from('test-secret').toString('base64')}
  })
  afterAll(() => {
    process.env = originalEnv
  })

  it('round-trips a signed payload', () => {
    const token = signGdriveToken({userId: 'user1', teamId: 'team1'})
    expect(verifyGdriveToken(token)).toEqual({userId: 'user1', teamId: 'team1'})
  })

  it('still verifies legacy tokens that carry a folderId', () => {
    const data = Buffer.from(
      JSON.stringify({userId: 'user1', teamId: 'team1', folderId: 'folder1'})
    ).toString('base64url')
    const sig = createHmac('sha256', Buffer.from(process.env.SERVER_SECRET!, 'base64'))
      .update(data)
      .digest('base64url')
    const legacy = `${data}.${sig}`
    expect(verifyGdriveToken(legacy)).toMatchObject({userId: 'user1', teamId: 'team1'})
  })

  it('rejects a tampered token', () => {
    const token = signGdriveToken({userId: 'user1', teamId: 'team1'})
    expect(verifyGdriveToken(`${token}x`)).toBeNull()
  })
})

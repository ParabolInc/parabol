import {Response} from '@whatwg-node/fetch'
import {postUntrusted} from '../fetchUntrusted'
import {Logger} from '../Logger'
import MattermostServerManager from '../MattermostServerManager'
import MSTeamsServerManager from '../MSTeamsServerManager'
import {logWebhookError, WebhookDestinationError} from '../postWebhook'

jest.mock('../fetchUntrusted', () => ({postUntrusted: jest.fn()}))
const mockPostUntrusted = jest.mocked(postUntrusted)

const WEBHOOK_URL = 'https://example.webhook.office.com/webhookb2/secret-path'

const managers = [
  ['MS Teams', () => new MSTeamsServerManager(WEBHOOK_URL).post('{}')],
  ['Mattermost', () => new MattermostServerManager(WEBHOOK_URL).postMessage('Meeting started')]
] as const

describe.each(managers)('%s webhook', (service, post) => {
  it.each([
    [401, 'Unauthorized'],
    [404, 'Not Found'],
    [405, 'Method Not Allowed'],
    [500, 'Internal Server Error']
  ])('blames the destination when it answers %i', async (status, statusText) => {
    mockPostUntrusted.mockResolvedValue(new Response(null, {status, statusText}))
    const result = await post()
    expect(result).toBeInstanceOf(WebhookDestinationError)
    expect(result).toHaveProperty('message', `${status}: ${statusText}`)
  })

  it('reports the message of a JSON answer', async () => {
    mockPostUntrusted.mockResolvedValue(
      new Response(JSON.stringify({message: 'Webhook disabled'}), {
        status: 403,
        statusText: 'Forbidden',
        headers: {'content-type': 'application/json'}
      })
    )
    expect(await post()).toHaveProperty('message', '403: Webhook disabled')
  })

  it('blames the destination when it cannot be reached', async () => {
    mockPostUntrusted.mockResolvedValue(null)
    const result = await post()
    expect(result).toBeInstanceOf(WebhookDestinationError)
    expect(result).toHaveProperty('message', `${service} webhook request failed`)
  })

  it('returns the answer of a destination that accepts the message', async () => {
    const accepted = new Response(null, {status: 202})
    mockPostUntrusted.mockResolvedValue(accepted)
    expect(await post()).toBe(accepted)
  })
})

describe('logWebhookError', () => {
  const options = {userId: 'user1', tags: {teamId: 'team1', event: 'meetingStart'}}
  const tags = {...options.tags, host: 'example.webhook.office.com'}

  it("logs the destination's verdict as a warning, without the secret path", () => {
    const warn = jest.spyOn(Logger, 'warn').mockImplementation()
    const error = jest.spyOn(Logger, 'error').mockImplementation()
    const refusal = new WebhookDestinationError('405: Method Not Allowed')
    logWebhookError(refusal, WEBHOOK_URL, options)
    expect(warn).toHaveBeenCalledWith(refusal, {userId: 'user1', tags})
    expect(error).not.toHaveBeenCalled()
  })

  it("logs Parabol's own failure as an error", () => {
    const error = jest.spyOn(Logger, 'error').mockImplementation()
    const bug = new Error('Invalid mattermost message')
    logWebhookError(bug, WEBHOOK_URL, options)
    expect(error).toHaveBeenCalledWith(bug, {userId: 'user1', tags})
  })
})

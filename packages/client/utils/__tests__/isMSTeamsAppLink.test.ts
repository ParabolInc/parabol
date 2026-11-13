import isMSTeamsAppLink from '../isMSTeamsAppLink'

describe('isMSTeamsAppLink', () => {
  it.each([
    'https://teams.microsoft.com/v2/',
    'https://teams.microsoft.com/l/team/19%3Aabc%40thread.tacv2/conversations?groupId=123',
    'https://teams.microsoft.com/l/chat/19:abc@unq.gbl.spaces/0',
    'https://teams.cloud.microsoft/',
    'https://teams.live.com/v2/',
    'https://gov.teams.microsoft.us/'
  ])('recognizes the Teams app link %s', (url) => {
    expect(isMSTeamsAppLink(url)).toBe(true)
  })

  it.each([
    'https://example.webhook.office.com/webhookb2/abc/IncomingWebhook/def',
    'https://prod-72.westus.logic.azure.com:443/workflows/abc/triggers/manual/paths/invoke',
    'https://default123.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/abc',
    'https://notteams.microsoft.com/hook',
    'not a url'
  ])('does not mistake %s for one', (url) => {
    expect(isMSTeamsAppLink(url)).toBe(false)
  })
})

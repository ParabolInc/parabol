const mockCreate = jest.fn()

jest.mock('mailgun.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    client: () => ({messages: {create: mockCreate}})
  }))
}))

import MailManagerMailgun from '../email/MailManagerMailgun'

const makeOptions = () => ({
  to: 'user@example.com',
  subject: 'Request to Reset Your Password',
  body: 'Forget your password? No problem, just go here: https://example.com/reset',
  html: '<p>Reset Password</p>'
})

describe('MailManagerMailgun', () => {
  let manager: MailManagerMailgun

  beforeEach(() => {
    mockCreate.mockResolvedValue({id: 'test-id', status: 200})
    manager = new MailManagerMailgun()
  })

  it("sends the plaintext body as Mailgun's `text` parameter", async () => {
    const options = makeOptions()
    await manager.sendEmail(options)

    const [, payload] = mockCreate.mock.calls[0]!
    expect(payload.text).toBe(options.body)
    // `body` is not a Mailgun parameter; sending it drops the text/plain part
    expect(payload).not.toHaveProperty('body')
  })

  it("sends attachments as Mailgun's `attachment` parameter", async () => {
    const attachments = [{filename: 'summary.pdf', path: '/tmp/summary.pdf', cid: 'cid1'}]
    await manager.sendEmail({...makeOptions(), attachments})

    const [, payload] = mockCreate.mock.calls[0]!
    expect(payload.attachment).toBe(attachments)
    expect(payload).not.toHaveProperty('attachments')
  })

  it('passes the domain, recipients, subject, html and tags through unchanged', async () => {
    process.env.MAILGUN_DOMAIN = 'mail.example.com'
    process.env.MAIL_FROM = 'noreply@mail.example.com'
    await manager.sendEmail({
      ...makeOptions(),
      to: ['a@example.com', 'b@example.com'],
      tags: ['type:resetPassword']
    })

    expect(mockCreate).toHaveBeenCalledWith(
      'mail.example.com',
      expect.objectContaining({
        to: 'a@example.com,b@example.com',
        from: 'noreply@mail.example.com',
        subject: 'Request to Reset Your Password',
        html: '<p>Reset Password</p>',
        'o:tag': ['type:resetPassword']
      })
    )
  })
})

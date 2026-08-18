import fs from 'fs'
import os from 'os'
import path from 'path'

const mockCreate = jest.fn()

jest.mock('mailgun.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    client: () => ({messages: {create: mockCreate}})
  }))
}))

jest.mock('../utils/logError', () => ({__esModule: true, default: jest.fn()}))

import MailManagerMailgun from '../email/MailManagerMailgun'
import logError from '../utils/logError'

const makeOptions = () => ({
  to: 'user@example.com',
  subject: 'Request to Reset Your Password',
  body: 'Forget your password? No problem, just go here: https://example.com/reset',
  html: '<p>Reset Password</p>'
})

describe('MailManagerMailgun', () => {
  let manager: MailManagerMailgun
  let tmpDir: string

  beforeEach(() => {
    mockCreate.mockReset()
    mockCreate.mockResolvedValue({id: 'test-id', status: 200})
    manager = new MailManagerMailgun()
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mailgun-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true})
  })

  it("sends the plaintext body as Mailgun's `text` parameter", async () => {
    const options = makeOptions()
    await manager.sendEmail(options)

    const [, payload] = mockCreate.mock.calls[0]!
    expect(payload.text).toBe(options.body)
    expect(payload).not.toHaveProperty('body')
  })

  it('sends file attachments as `attachment` with the file bytes as `data`', async () => {
    const filePath = path.join(tmpDir, 'summary.pdf')
    fs.writeFileSync(filePath, 'PDF BYTES')
    const attachments = [{filename: 'summary.pdf', path: filePath}]

    const success = await manager.sendEmail({...makeOptions(), attachments})

    expect(success).toBe(true)
    const [, payload] = mockCreate.mock.calls[0]!
    expect(payload).not.toHaveProperty('attachments')
    expect(payload.inline).toBeUndefined()
    expect(payload.attachment).toHaveLength(1)
    const [file] = payload.attachment
    expect(file.filename).toBe('summary.pdf')
    expect(file.contentType).toBe('application/pdf')
    expect(Buffer.isBuffer(file.data)).toBe(true)
    expect(file.data.toString()).toBe('PDF BYTES')
    expect(file).not.toHaveProperty('path')
  })

  it('sends attachments with a `cid` as `inline`, named by the cid so `cid:` references resolve', async () => {
    const filePath = path.join(tmpDir, 'logo.png')
    fs.writeFileSync(filePath, 'PNG BYTES')
    const attachments = [{filename: 'logo.png', path: filePath, cid: 'logo'}]

    await manager.sendEmail({...makeOptions(), attachments})

    const [, payload] = mockCreate.mock.calls[0]!
    expect(payload.attachment).toBeUndefined()
    expect(payload.inline).toHaveLength(1)
    const [file] = payload.inline
    expect(file.filename).toBe('logo')
    expect(file.contentType).toBe('image/png')
    expect(file.data.toString()).toBe('PNG BYTES')
  })

  it('splits a mixed list into `attachment` and `inline`', async () => {
    const pdfPath = path.join(tmpDir, 'summary.pdf')
    const pngPath = path.join(tmpDir, 'logo.png')
    fs.writeFileSync(pdfPath, 'PDF')
    fs.writeFileSync(pngPath, 'PNG')

    await manager.sendEmail({
      ...makeOptions(),
      attachments: [
        {filename: 'summary.pdf', path: pdfPath},
        {filename: 'logo.png', path: pngPath, cid: 'logo'}
      ]
    })

    const [, payload] = mockCreate.mock.calls[0]!
    expect(payload.attachment.map((f: {filename: string}) => f.filename)).toEqual(['summary.pdf'])
    expect(payload.inline.map((f: {filename: string}) => f.filename)).toEqual(['logo'])
  })

  it('omits `attachment` and `inline` when there are no attachments', async () => {
    await manager.sendEmail(makeOptions())

    const [, payload] = mockCreate.mock.calls[0]!
    expect(payload.attachment).toBeUndefined()
    expect(payload.inline).toBeUndefined()
  })

  it('returns false and logs when an attachment file cannot be read', async () => {
    const attachments = [{filename: 'missing.pdf', path: path.join(tmpDir, 'missing.pdf')}]

    const success = await manager.sendEmail({...makeOptions(), attachments})

    expect(success).toBe(false)
    expect(mockCreate).not.toHaveBeenCalled()
    expect(logError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({tags: expect.objectContaining({type: 'Mailgun error'})})
    )
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

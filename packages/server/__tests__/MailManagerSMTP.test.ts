import nodemailer from 'nodemailer'
import logError from '../utils/logError'

jest.mock('nodemailer', () => ({
  createTransport: jest.fn()
}))

jest.mock('../utils/logError', () => ({
  __esModule: true,
  default: jest.fn()
}))

import MailManagerSMTP from '../email/MailManagerSMTP'

const mockCreateTransport = jest.mocked(nodemailer.createTransport)
const mockLogError = jest.mocked(logError)

const makeOptions = (to: string | string[]) => ({
  to,
  subject: 'Test Subject',
  body: 'Test body',
  html: '<p>Test</p>'
})

const makeRecipients = (count: number) =>
  Array.from({length: count}, (_, i) => `user${i}@example.com`)

describe('MailManagerSMTP', () => {
  let mockSendMail: jest.Mock
  let manager: MailManagerSMTP

  beforeEach(() => {
    mockSendMail = jest.fn().mockResolvedValue({messageId: 'test-id'})
    mockCreateTransport.mockReturnValue({sendMail: mockSendMail, verify: jest.fn()} as any)
    manager = new MailManagerSMTP()
  })

  describe('sendEmail', () => {
    it('wraps single string recipient in array and sends one batch', async () => {
      const result = await manager.sendEmail(makeOptions('user@example.com'))

      expect(mockSendMail).toHaveBeenCalledTimes(1)
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({to: ['user@example.com']})
      )
      expect(result).toBe(true)
    })

    it('sends one batch for exactly 50 recipients', async () => {
      const to = makeRecipients(50)
      await manager.sendEmail(makeOptions(to))

      expect(mockSendMail).toHaveBeenCalledTimes(1)
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({to}))
    })

    it('splits 51 recipients into 2 batches', async () => {
      const to = makeRecipients(51)
      await manager.sendEmail(makeOptions(to))

      expect(mockSendMail).toHaveBeenCalledTimes(2)
      expect(mockSendMail).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({to: to.slice(0, 50)})
      )
      expect(mockSendMail).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({to: to.slice(50)})
      )
    })

    it('splits 100 recipients into 2 batches of 50', async () => {
      const to = makeRecipients(100)
      await manager.sendEmail(makeOptions(to))

      expect(mockSendMail).toHaveBeenCalledTimes(2)
    })

    it('splits 150 recipients into 3 batches of 50', async () => {
      const to = makeRecipients(150)
      await manager.sendEmail(makeOptions(to))

      expect(mockSendMail).toHaveBeenCalledTimes(3)
    })

    it('passes subject, body, html, and from to transport', async () => {
      process.env.MAIL_FROM = 'noreply@example.com'
      await manager.sendEmail(makeOptions('user@example.com'))

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@example.com',
          subject: 'Test Subject',
          text: 'Test body',
          html: '<p>Test</p>'
        })
      )
    })

    it('passes attachments to transport', async () => {
      const attachments = [{filename: 'file.pdf', path: '/tmp/file.pdf', cid: 'cid1'}]
      await manager.sendEmail({...makeOptions('user@example.com'), attachments})

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({attachments}))
    })

    it('logs error and returns false when a batch fails with an Error', async () => {
      const err = new Error('SMTP failure')
      mockSendMail.mockRejectedValue(err)

      const result = await manager.sendEmail(makeOptions('user@example.com'))

      expect(mockLogError).toHaveBeenCalledWith(err, expect.any(Object))
      expect(result).toBe(false)
    })

    it('wraps non-Error rejections in generic Error before logging', async () => {
      mockSendMail.mockRejectedValue('some string error')

      await manager.sendEmail(makeOptions('user@example.com'))

      expect(mockLogError).toHaveBeenCalledWith(
        expect.objectContaining({message: 'SMTP nodemailer error'}),
        expect.any(Object)
      )
    })

    it('logs only failed batches when some batches succeed', async () => {
      const to = makeRecipients(51)
      const err = new Error('batch 2 failed')
      mockSendMail.mockResolvedValueOnce({messageId: 'ok'}).mockRejectedValueOnce(err)

      const result = await manager.sendEmail(makeOptions(to))

      expect(mockLogError).toHaveBeenCalledTimes(1)
      expect(mockLogError).toHaveBeenCalledWith(err, expect.any(Object))
      expect(result).toBe(false)
    })
  })
})

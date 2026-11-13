import typedLookup from '../../client/types/typedLookup'
import type MailManager from './MailManager'

let mailManager: MailManager

// each provider's client is a lot of code, so only the configured one is evaluated, by the first email.
// They are requires so this getter stays synchronous
const managerLoaders = {
  mailgun: () => (require('./MailManagerMailgun') as typeof import('./MailManagerMailgun')).default,
  google: () => (require('./MailManagerGoogle') as typeof import('./MailManagerGoogle')).default,
  smtp: () => (require('./MailManagerSMTP') as typeof import('./MailManagerSMTP')).default,
  debug: () => (require('./MailManagerDebug') as typeof import('./MailManagerDebug')).default
} as const

// the SMTP manager verifies its transport when it is evaluated, which an admin debugging SMTP expects at startup
if (process.env.MAIL_SMTP_DEBUG === 'true') managerLoaders.smtp()

const getMailManager = () => {
  if (!mailManager) {
    const mailProvider = process.env.MAIL_PROVIDER!
    const loadManager = typedLookup(managerLoaders, mailProvider) ?? managerLoaders.debug
    const Manager = loadManager()
    mailManager = new Manager()
  }
  return mailManager
}

export default getMailManager

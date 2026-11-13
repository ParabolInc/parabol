import typedLookup from '../../client/types/typedLookup'
import type MailManager from './MailManager'

// each provider's client is a lot of code, so the first email evaluates only the configured one
const managerLoaders = {
  mailgun: async () => (await import(/* webpackMode: "eager" */ './MailManagerMailgun')).default,
  google: async () => (await import(/* webpackMode: "eager" */ './MailManagerGoogle')).default,
  smtp: async () => (await import(/* webpackMode: "eager" */ './MailManagerSMTP')).default,
  debug: async () => (await import(/* webpackMode: "eager" */ './MailManagerDebug')).default
} as const

// the SMTP manager verifies its transport when it is evaluated, which an admin debugging SMTP expects at startup
if (process.env.MAIL_SMTP_DEBUG === 'true') managerLoaders.smtp()

const makeMailManager = async (): Promise<MailManager> => {
  const mailProvider = process.env.MAIL_PROVIDER!
  const loadManager = typedLookup(managerLoaders, mailProvider) ?? managerLoaders.debug
  const Manager = await loadManager()
  return new Manager()
}

let mailManager: Promise<MailManager> | undefined

const getMailManager = () => {
  mailManager ??= makeMailManager()
  return mailManager
}

export default getMailManager

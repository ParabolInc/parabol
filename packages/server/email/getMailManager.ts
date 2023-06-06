import MailManager from './MailManager'
import MailManagerDebug from './MailManagerDebug'
import MailManagerGoogle from './MailManagerGoogle'
import MailManagerMailgun from './MailManagerMailgun'
import MailManagerSMTP from './MailManagerSMTP'

let mailManager: MailManager

const managers = {
  mailgun: MailManagerMailgun,
  google: MailManagerGoogle,
  smtp: MailManagerSMTP,
  debug: MailManagerDebug
} as const

const getMailManager = () => {
  if (!mailManager) {
    const mailProvider = process.env.MAIL_PROVIDER!
    const Manager = managers[mailProvider as keyof typeof managers] ?? MailManagerDebug
    mailManager = new Manager()
  }
  return mailManager
}

export default getMailManager

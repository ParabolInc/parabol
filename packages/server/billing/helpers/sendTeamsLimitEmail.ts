import getMailManager from '../../email/getMailManager'
import teamLimitsEmailCreator from '../../email/teamLimitsEmailCreator'
import type {User} from '../../postgres/types'

export type TeamLimitsEmailType = 'locked' | 'sevenDayWarning' | 'thirtyDayWarning'

type Props = {
  user: User
  orgId: string
  orgName: string
  emailType: TeamLimitsEmailType
}

const sendTeamsLimitEmail = async (props: Props) => {
  const {user, orgName, orgId, emailType} = props
  const {preferredName, email} = user
  const {subject, body, html} = teamLimitsEmailCreator({
    orgId,
    preferredName,
    orgName,
    emailType
  })
  const mailManager = await getMailManager()
  return mailManager.sendEmail({
    to: email,
    subject,
    body,
    html
  })
}

export default sendTeamsLimitEmail

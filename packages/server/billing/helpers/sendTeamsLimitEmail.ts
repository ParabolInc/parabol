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

const sendTeamsLimitEmail = (props: Props) => {
  const {user, orgName, orgId, emailType} = props
  const {id: userId, preferredName, email} = user
  const {subject, body, html} = teamLimitsEmailCreator({
    userId,
    email,
    orgId,
    preferredName,
    orgName,
    emailType
  })
  return getMailManager().sendEmail({
    to: email,
    subject,
    body,
    html
  })
}

export default sendTeamsLimitEmail

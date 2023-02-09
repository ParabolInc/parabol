import getMailManager from '../../email/getMailManager'
import teamLimitsEmailCreator from '../../email/teamLimitsEmailCreator'
import IUser from '../../postgres/types/IUser'

export type TeamLimitsEmailType = 'locked' | 'sevenDayWarning' | 'thirtyDayWarning'

type Props = {
  user: IUser
  orgId: string
  orgName: string
  emailType: TeamLimitsEmailType
}

const sendTeamsLimitEmail = (props: Props) => {
  const {user, orgName, orgId, emailType} = props
  const {id: userId, preferredName, email} = user
  const {subject, body, html} = teamLimitsEmailCreator({
    userId,
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

import getMailManager from '../../email/getMailManager'
import limitsEmailCreator from '../../email/limitsEmailCreator'
import IUser from '../../postgres/types/IUser'

export type TeamLimitsEmailType = 'locked' | 'sevenDayWarning' | 'thirtyDayWarning'

type Props = {
  user: IUser
  orgId: string
  orgName: string
  stickyTeamCount?: number
  emailType: TeamLimitsEmailType
}

const sendTeamsLimitEmail = (props: Props) => {
  const {user, orgName, orgId, emailType, stickyTeamCount} = props
  const {id: userId, preferredName, email} = user
  const {subject, body, html} = limitsEmailCreator({
    userId,
    orgId,
    preferredName,
    orgName,
    emailType,
    stickyTeamCount
  })
  return getMailManager().sendEmail({
    to: email,
    subject,
    body,
    html
  })
}

export default sendTeamsLimitEmail

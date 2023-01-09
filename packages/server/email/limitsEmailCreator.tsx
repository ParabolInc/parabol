import LockedEmail from 'parabol-client/modules/email/components/LimitsEmails/LockedEmail'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import SevenDayWarningEmail from '../../client/modules/email/components/LimitsEmails/SevenDayWarningEmail'
import ThirtyDayWarningEmail from '../../client/modules/email/components/LimitsEmails/ThirtyDayWarningEmail'
import {TeamLimitsEmailType} from '../billing/helpers/sendTeamsLimitEmail'
import {analytics} from '../utils/analytics/analytics'
import emailTemplate from './emailTemplate'

// const textOnlySummary = (props: TextSummaryProps) => {
//   const {preferredName, notificationCount, appOrigin} = props
//   const taskUrl = makeAppURL(appOrigin, 'me/tasks')
//   return `Hi ${preferredName} -

// You have ${notificationCount} new ${plural(
//     notificationCount,
//     'notification'
//   )} — see what’s changed with your teams.

// You can see everything on your plate in the Tasks view: ${taskUrl}

// If you need anything from us, don’t hesitate to reach out at ${ContactInfo.EMAIL_LOVE}.

// Have fun & do great work,
// - Parabol Team
// ${ExternalLinks.TEAM}
// `
// }

interface Props {
  userId: string
  preferredName: string
  orgId: string
  orgName: string
  stickyTeamCount?: number
  emailType: TeamLimitsEmailType
}

const limitsEmailCreator = (props: Props) => {
  const {userId, preferredName, orgId, emailType, orgName, stickyTeamCount} = props
  const Email =
    emailType === 'locked'
      ? LockedEmail
      : emailType === 'sevenDayWarning'
      ? SevenDayWarningEmail
      : ThirtyDayWarningEmail
  const bodyContent = ReactDOMServer.renderToStaticMarkup(
    <Email
      preferredName={preferredName}
      orgId={orgId}
      orgName={orgName}
      stickyTeamCount={stickyTeamCount ?? 0}
    />
  )

  const subject =
    emailType === 'locked'
      ? `Parabol Account Deactivated`
      : emailType === 'sevenDayWarning'
      ? `Parabol Account - Action Required`
      : `Parabol Account - Team Limit Reached`

  const html = emailTemplate({
    bodyContent,
    title: subject,
    previewText: subject,
    bgColor: PALETTE.SLATE_200
  })

  analytics.teamsLimitEmailSent(userId, orgId, emailType)

  return {
    subject,
    body: `Test`,
    html
  }
}

export default limitsEmailCreator

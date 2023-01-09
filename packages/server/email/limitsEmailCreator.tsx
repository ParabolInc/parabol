import LockedEmail from 'parabol-client/modules/email/components/LimitsEmails/LockedEmail'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import SevenDayWarningEmail from '../../client/modules/email/components/LimitsEmails/SevenDayWarningEmail'
import {TeamLimitsEmailType} from '../billing/helpers/sendTeamsLimitEmail'
import {analytics} from '../utils/analytics/analytics'
import emailTemplate from './emailTemplate'

interface Props {
  userId: string
  preferredName: string
  orgId: string
  orgName: string
  emailType: TeamLimitsEmailType
}

const limitsEmailCreator = (props: Props) => {
  const {userId, preferredName, orgId, emailType, orgName} = props
  const Email = emailType === 'locked' ? LockedEmail : SevenDayWarningEmail
  const bodyContent = ReactDOMServer.renderToStaticMarkup(
    <Email preferredName={preferredName} orgId={orgId} orgName={orgName} />
  )

  const subject =
    emailType === 'locked' ? `Parabol Account Deactivated` : `Parabol Account - Action Required`

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

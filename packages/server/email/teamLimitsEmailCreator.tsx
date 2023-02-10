import LockedEmail from 'parabol-client/modules/email/components/LimitsEmails/LockedEmail'
import SevenDayWarningEmail from 'parabol-client/modules/email/components/LimitsEmails/SevenDayWarningEmail'
import ThirtyDayWarningEmail from 'parabol-client/modules/email/components/LimitsEmails/ThirtyDayWarningEmail'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import {Threshold} from '../../client/types/constEnums'
import makeAppURL from '../../client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import {TeamLimitsEmailType} from '../billing/helpers/sendTeamsLimitEmail'
import {analytics} from '../utils/analytics/analytics'
import emailTemplate from './emailTemplate'

const textOnlySummary = (props: Props) => {
  const {preferredName, orgId, emailType, orgName} = props
  const billingURL = makeAppURL(appOrigin, `/me/organizations/${orgId}/billing`, {
    searchParams: {
      utm_source: 'notification email',
      utm_medium: 'email',
      utm_campaign: 'locked-email'
    }
  })

  const emailTextLookup = {
    thirtyDayWarning: `Hi ${preferredName} 👋

    This is a friendly note to let you know that ${orgName} has officially reached ${Threshold.MAX_STARTER_TIER_TEAMS} active teams on Parabol - congrats! We love to see organizations finding value in Parabol and improving their teams in the process.

    As a reminder: Parabol's Starter Plan has a limit of two teams. Please upgrade your account to continue using Parabol with all of your teams: ${billingURL}

    If you aren’t ready to upgrade, then in ${Threshold.STARTER_TIER_LOCK_AFTER_DAYS} days your account will revert to the two teams allowed on the Starter Plan. Feel free to contact us with any questions - we’re here to help!

    Parabol Team
  `,
    sevenDayWarning: `Hi ${preferredName} 👋

    This is a follow-up notification to remind you that ${orgName}'s Parabol account is at risk of deactivation because you’ve exceeded the two team limit on your Starter Plan.

    Once your account is deactivated, you will lose access to your teams and won’t be able to run Retrospective, Sprint Poker or Standup meetings with Parabol.

    You'll need to upgrade your account within the next ${Threshold.FINAL_WARNING_DAYS_BEFORE_LOCK} days to avoid losing access to your agile meetings: ${billingURL}

    If you aren’t able to upgrade, we'll automatically deactivate the teams over the limit. If you have any questions, or if you'd like to discuss enterprise plans, feel free to contact us - we're happy to help make this process as smooth as possible.

    Parabol Team
    `,
    locked: `Hi ${preferredName} 👋

    Unfortunately, ${orgName} has exceeded the two-team limit on the Starter Plan for more than ${Threshold.STARTER_TIER_LOCK_AFTER_DAYS} days, and your account has been deactivated.

    Your teams will not be able to run meetings with Parabol, add new teams to your account, or access previous teams.

    You can re-activate your teams by upgrading your account: ${billingURL}

    If you have any questions, or if you'd like to discuss enterprise plans, feel free to contact us — we’re here to help.

    Parabol Team
  `
  }

  return emailTextLookup[emailType]
}

interface Props {
  userId: string
  preferredName: string
  orgId: string
  orgName: string
  emailType: TeamLimitsEmailType
}

const teamLimitsEmailCreator = (props: Props) => {
  const {userId, preferredName, orgId, emailType, orgName} = props
  const Email =
    emailType === 'locked'
      ? LockedEmail
      : emailType === 'sevenDayWarning'
      ? SevenDayWarningEmail
      : ThirtyDayWarningEmail
  const bodyContent = ReactDOMServer.renderToStaticMarkup(
    <Email preferredName={preferredName} orgId={orgId} orgName={orgName} appOrigin={appOrigin} />
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

  analytics.notificationEmailSent(userId, orgId, emailType)

  return {
    subject,
    body: textOnlySummary(props),
    html
  }
}

export default teamLimitsEmailCreator

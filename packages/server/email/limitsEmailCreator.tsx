import LockedEmail from 'parabol-client/modules/email/components/LimitsEmails/LockedEmail'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import SevenDayWarningEmail from '../../client/modules/email/components/LimitsEmails/SevenDayWarningEmail'
import emailTemplate from './emailTemplate'

interface Props {
  orgId: string
  preferredName: string
  emailType: 'locked' | 'sevenDayWarning' | 'thirtyDayWarning'
  orgName: string
}

const limitsEmailCreator = (props: Props) => {
  const {preferredName, orgId, emailType, orgName} = props
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

  return {
    subject,
    body: `Test`,
    html
  }
}

export default limitsEmailCreator

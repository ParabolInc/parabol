import {NotificationSummaryProps} from 'parabol-client/modules/email/components/NotificationSummaryEmail'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {ContactInfo, ExternalLinks} from 'parabol-client/types/constEnums'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import plural from 'parabol-client/utils/plural'
import React from 'react'
import emailTemplate from './emailTemplate'
import renderSSRElement from './renderSSRElement'
import ServerEnvironment from './ServerEnvironment'

type TextSummaryProps = Omit<NotificationSummaryProps, 'notificationRefs'>
const textOnlySummary = (props: TextSummaryProps) => {
  const {preferredName, notificationCount, appOrigin} = props
  const taskUrl = makeAppURL(appOrigin, 'me/tasks')
  return `Hi ${preferredName} -

You have ${notificationCount} new ${plural(
    notificationCount,
    'notification'
  )} — see what’s changed with your teams.

You can see everything on your plate in the Tasks view: ${taskUrl}

If you need anything from us, don’t hesitate to reach out at ${ContactInfo.EMAIL_LOVE}.

Have fun & do great work,
- Parabol Team
${ExternalLinks.TEAM}
`
}

interface Props {
  appOrigin: string
  preferredName: string
  notificationCount: number
  environment: ServerEnvironment
}

const notificationSummaryCreator = async (props: Props) => {
  const {notificationCount} = props
  const subject = `You have ${notificationCount} new ${plural(
    notificationCount,
    'notification'
  )} 👀`

  // When this component is imported directly, parts of the build fail due to generated relay files
  // being imported before they're created.
  // :TODO: (jmtaber129): Investigate why that is, and import this normally.
  const NotificationSummaryEmailRoot =
    require('parabol-client/modules/email/components/NotificationSummaryEmailRoot').default

  const bodyContent = await renderSSRElement(
    <NotificationSummaryEmailRoot {...props} />,
    props.environment
  )

  const html = emailTemplate({
    bodyContent,
    title: subject,
    previewText: subject,
    bgColor: PALETTE.SLATE_200
  })

  return {
    subject,
    body: textOnlySummary(props),
    html
  }
}

export default notificationSummaryCreator

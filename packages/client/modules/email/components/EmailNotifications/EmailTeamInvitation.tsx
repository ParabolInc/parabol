import graphql from 'babel-plugin-relay/macro'
import {EmailTeamInvitation_notification$key} from 'parabol-client/__generated__/EmailTeamInvitation_notification.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import makeAppURL from '../../../../utils/makeAppURL'
import {notificationSummaryUrlParams} from '../NotificationSummaryEmail'
import EmailNotificationTemplate from './EmailNotificationTemplate'

interface Props {
  notificationRef: EmailTeamInvitation_notification$key
  appOrigin: string
}

const EmailTeamInvitation = (props: Props) => {
  const {notificationRef, appOrigin} = props
  const notification = useFragment(
    graphql`
      fragment EmailTeamInvitation_notification on NotificationTeamInvitation {
        ...EmailNotificationTemplate_notification
        id
        invitation {
          token
          inviter {
            rasterPicture
            preferredName
          }
        }
        team {
          name
        }
      }
    `,
    notificationRef
  )
  const {invitation, team} = notification
  const {name: teamName} = team
  const {token, inviter} = invitation
  const {preferredName: inviterName, rasterPicture: inviterPicture} = inviter

  const linkUrl = makeAppURL(appOrigin, `team-invitation/${token}`, {
    searchParams: notificationSummaryUrlParams
  })

  return (
    <EmailNotificationTemplate
      avatar={inviterPicture}
      message={`${inviterName} invited you to join their team ${teamName}`}
      notificationRef={notification}
      linkLabel='Accept invitation'
      linkUrl={linkUrl}
    />
  )
}

export default EmailTeamInvitation

import graphql from 'babel-plugin-relay/macro'
import {ASSIGNEE, MENTIONEE} from 'parabol-client/utils/constants'
import {EmailTaskInvolves_notification$key} from 'parabol-client/__generated__/EmailTaskInvolves_notification.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import makeAppURL from '../../../../utils/makeAppURL'
import {notificationSummaryUrlParams} from '../NotificationSummaryEmail'
import EmailTaskCard from '../SummaryEmail/MeetingSummaryEmail/EmailTaskCard'
import EmailNotificationTemplate from './EmailNotificationTemplate'

const involvementWord = {
  [ASSIGNEE]: 'assigned',
  [MENTIONEE]: 'mentioned'
}

interface Props {
  notificationRef: EmailTaskInvolves_notification$key
  appOrigin: string
}

const deletedTask = {
  tags: [] as string[]
} as const

const EmailTaskInvolves = (props: Props) => {
  const {notificationRef, appOrigin} = props
  const notification = useFragment(
    graphql`
      fragment EmailTaskInvolves_notification on NotifyTaskInvolves {
        ...EmailNotificationTemplate_notification
        changeAuthor {
          user {
            rasterPicture
          }
          preferredName
        }
        involvement
        status
        team {
          id
          name
        }
        task {
          tags
          ...EmailTaskCard_task
        }
      }
    `,
    notificationRef
  )
  const {task, team, involvement, changeAuthor} = notification
  const {tags} = task || deletedTask
  const {user, preferredName: changeAuthorName} = changeAuthor
  const {rasterPicture: changeAuthorPicture} = user
  const {name: teamName, id: teamId} = team
  const action = involvementWord[involvement]

  const archiveSuffix = tags.includes('archived') ? '/archive' : ''
  const preposition = involvement === MENTIONEE ? ' in' : ''

  const linkUrl = makeAppURL(appOrigin, `/team/${teamId}${archiveSuffix}`, {
    searchParams: notificationSummaryUrlParams
  })

  return (
    <EmailNotificationTemplate
      avatar={changeAuthorPicture}
      message={`${changeAuthorName} ${action} you ${preposition} a task on the ${teamName} team.`}
      notificationRef={notification}
      linkLabel='See the task'
      linkUrl={linkUrl}
    >
      {task && (
        <table style={{marginTop: '12px'}}>
          <EmailTaskCard task={task} maxWidth={330} />
        </table>
      )}
    </EmailNotificationTemplate>
  )
}

export default EmailTaskInvolves

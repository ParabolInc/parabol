import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import useRouter from '../hooks/useRouter'
import {MeetingStageTimeLimitEnd_notification} from '../__generated__/MeetingStageTimeLimitEnd_notification.graphql'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: MeetingStageTimeLimitEnd_notification
}

const MeetingStageTimeLimitEnd = (props: Props) => {
  const {notification} = props

  const {t} = useTranslation()

  const {history} = useRouter()
  const {meeting} = notification
  const {id: meetingId, name: meetingName, team} = meeting
  const {name: teamName} = team
  const goThere = () => {
    history.push(
      t('MeetingStageTimeLimitEnd.MeetMeetingId', {
        meetingId
      })
    )
  }

  return (
    <NotificationTemplate
      message={t(
        'MeetingStageTimeLimitEnd.YourMeetingMeetingNameWithTeamNameIsReadyToMoveForward',
        {
          meetingName,
          teamName
        }
      )}
      notification={notification}
      action={
        <NotificationAction label={t('MeetingStageTimeLimitEnd.GoToMeeting')} onClick={goThere} />
      }
    />
  )
}

export default createFragmentContainer(MeetingStageTimeLimitEnd, {
  notification: graphql`
    fragment MeetingStageTimeLimitEnd_notification on NotificationMeetingStageTimeLimitEnd {
      ...NotificationTemplate_notification
      id
      meeting {
        id
        name
        team {
          name
        }
      }
    }
  `
})

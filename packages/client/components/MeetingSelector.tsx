import {MeetingTypeEnum} from '../types/graphql'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import useRouter from '../hooks/useRouter'
import {MeetingSelector_viewer} from '__generated__/MeetingSelector_viewer.graphql'
import lazyPreload from '../utils/lazyPreload'

interface Props {
  meetingId: string
  viewer: MeetingSelector_viewer
}

const meetingLookup = {
  [MeetingTypeEnum.action]: lazyPreload(() =>
    import(/* webpackChunkName: 'ActionMeeting' */ './ActionMeeting')
  ),
  [MeetingTypeEnum.retrospective]: lazyPreload(() =>
    import(/* webpackChunkName: 'RetroMeeting' */ './RetroMeeting')
  )
}

const MeetingSelector = (props: Props) => {
  const {meetingId, viewer} = props
  const {meeting} = viewer
  const {history} = useRouter()
  useEffect(() => {
    if (!meeting) {
      history.replace({
        pathname: `/invitation-required`,
        search: `?redirectTo=${encodeURIComponent(window.location.pathname)}&meetingId=${meetingId}`
      })
    }
  }, [])
  if (!meeting) return null
  const {meetingType} = meeting
  const Meeting = meetingLookup[meetingType]
  return <Meeting meeting={meeting} />
}

export default createFragmentContainer(MeetingSelector, {
  viewer: graphql`
    fragment MeetingSelector_viewer on User {
      meeting(meetingId: $meetingId) {
        meetingType
        ...RetroMeeting_meeting
        ...ActionMeeting_meeting
      }
    }
  `
})

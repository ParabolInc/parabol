import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import SetAppLocationMutation from '~/mutations/SetAppLocationMutation'
import useRouter from '../hooks/useRouter'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import lazyPreload from '../utils/lazyPreload'
import {MeetingSelectorQuery} from '../__generated__/MeetingSelectorQuery.graphql'
interface Props {
  meetingId: string
  queryRef: PreloadedQuery<MeetingSelectorQuery>
}

const meetingLookup = {
  action: lazyPreload(() => import(/* webpackChunkName: 'ActionMeeting' */ './ActionMeeting')),
  poker: lazyPreload(() => import(/* webpackChunkName: 'PokerMeeting' */ './PokerMeeting')),
  retrospective: lazyPreload(() => import(/* webpackChunkName: 'RetroMeeting' */ './RetroMeeting')),
  teamPrompt: lazyPreload(
    () => import(/* webpackChunkName: 'TeamPromptMeeting' */ './TeamPromptMeeting')
  )
}

const MeetingSelector = (props: Props) => {
  const {meetingId, queryRef} = props

  const {history} = useRouter()
  const atmosphere = useAtmosphere()
  const data = usePreloadedQuery<MeetingSelectorQuery>(
    graphql`
      query MeetingSelectorQuery($meetingId: ID!) {
        viewer {
          isConnected
          meeting(meetingId: $meetingId) {
            ...MeetingSelector_meeting @relay(mask: false)
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const {viewer} = data
  const {isConnected, meeting} = viewer
  useEffect(() => {
    if (!meeting) {
      history.replace({
        pathname: `/invitation-required`,
        search: `?redirectTo=${encodeURIComponent(window.location.pathname)}&meetingId=${meetingId}`
      })
    }
  }, [])

  useEffect(() => {
    if (!meetingId || !isConnected) return
    const location = `/meet/${meetingId}`
    const setAfterUpgrade = async () => {
      await atmosphere.upgradeTransport()
      SetAppLocationMutation(atmosphere, {location})
    }
    setAfterUpgrade()
    return () => {
      SetAppLocationMutation(atmosphere, {location: null})
    }
  }, [isConnected])
  useSubscription('MeetingSelector', NotificationSubscription)
  useSubscription('MeetingSelector', OrganizationSubscription)
  useSubscription('MeetingSelector', TaskSubscription)
  useSubscription('MeetingSelector', TeamSubscription)
  if (!meeting) return null
  const {meetingType} = meeting
  const Meeting = meetingLookup[meetingType]
  return <Meeting meeting={meeting as any} />
}

graphql`
  fragment MeetingSelector_meeting on NewMeeting {
    ...RetroMeeting_meeting
    ...ActionMeeting_meeting
    ...PokerMeeting_meeting
    meetingType
  }
`

export default MeetingSelector

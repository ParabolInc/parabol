import {useEffect} from 'react'
import {fetchQuery, useQueryLoader} from 'react-relay'
import {useNavigate} from 'react-router'
import meetingSelectorQuery, {
  type MeetingSelectorQuery
} from '../__generated__/MeetingSelectorQuery.graphql'
import Atmosphere from '../Atmosphere'
import JoinMeetingMutation from '../mutations/JoinMeetingMutation'
import MeetingSubscription from '../subscriptions/MeetingSubscription'
import {addBreadcrumb} from '../utils/clientBreadcrumbs'
import useAtmosphere from './useAtmosphere'

// Joins, subscribes, and fetches the meeting only once the server acknowledges that the subscription is listening.
// The subscription's messages wait until that fetch is in the store, so none are missed or overwritten.
// A reconnect makes the server acknowledge the subscription again, which fetches the meeting again.
// A viewer the store already knows is in the meeting, like the one who just started it, subscribes while joining.
const useJoinedMeetingQuery = (meetingId: string | undefined) => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const [queryRef, loadQuery] = useQueryLoader<MeetingSelectorQuery>(meetingSelectorQuery)
  useEffect(() => {
    if (!meetingId) return
    const variables = {meetingId}
    const subKey = Atmosphere.getKey(MeetingSubscription.key, variables)
    let isMounted = true
    const fetchMeeting = (releaseSubscription?: () => void) => {
      fetchQuery<MeetingSelectorQuery>(atmosphere, meetingSelectorQuery, variables, {
        fetchPolicy: 'network-only'
      }).subscribe({
        complete: () => {
          addBreadcrumb(
            'operation',
            isMounted
              ? 'MeetingSelectorQuery fetched, loaded from the store'
              : 'MeetingSelectorQuery fetched after leaving'
          )
          if (isMounted) loadQuery(variables, {fetchPolicy: 'store-only'})
          releaseSubscription?.()
        },
        error: () => {
          addBreadcrumb(
            'operation',
            isMounted
              ? 'MeetingSelectorQuery fetch failed, loading from the network'
              : 'MeetingSelectorQuery fetch failed after leaving'
          )
          releaseSubscription?.()
          if (isMounted) loadQuery(variables, {fetchPolicy: 'network-only'})
        }
      })
    }
    // the fetched meeting must include the viewer's own join
    let resolveJoined = () => {}
    const joined = new Promise<void>((resolve) => {
      resolveJoined = resolve
    })
    const fetchOnceJoined = (releaseSubscription?: () => void) => {
      joined.then(() => (isMounted ? fetchMeeting(releaseSubscription) : releaseSubscription?.()))
    }
    let ackTimeout: number | undefined
    let releaseMeetingSubscription: (() => void) | undefined
    const fetchWhileHoldingSubscription = () => {
      addBreadcrumb('websocket', 'MeetingSubscription acknowledged')
      window.clearTimeout(ackTimeout)
      fetchOnceJoined(atmosphere.holdSubscription(subKey))
    }
    const subscribe = () => {
      const isAlreadySubscribed = atmosphere.isSubscribed(subKey)
      atmosphere.subscriptionAckHandlers.set(subKey, fetchWhileHoldingSubscription)
      releaseMeetingSubscription = atmosphere.retainSubscription(
        MeetingSubscription,
        variables,
        {navigate},
        5000
      )
      if (isAlreadySubscribed) fetchWhileHoldingSubscription()
      // a socket server older than this client never acknowledges a subscription
      else
        ackTimeout = window.setTimeout(() => {
          addBreadcrumb('websocket', 'MeetingSubscription not acknowledged within 5s')
          fetchOnceJoined()
        }, 5000)
    }
    const isViewerMeetingMember = Boolean(
      atmosphere.getStore().getSource().get(meetingId)?.viewerMeetingMember
    )
    if (isViewerMeetingMember) subscribe()
    JoinMeetingMutation(atmosphere, variables, {
      onCompleted: (response) => {
        if (!isMounted) return
        // not on the team, or the meeting ended before the viewer joined: nothing to subscribe to
        if (!response.joinMeeting?.JoinMeetingMutation_meeting) {
          addBreadcrumb('operation', 'JoinMeetingMutation did not join')
          fetchMeeting()
          return
        }
        addBreadcrumb('operation', 'JoinMeetingMutation joined')
        resolveJoined()
        if (!isViewerMeetingMember) subscribe()
      },
      onError: () => {
        addBreadcrumb('operation', 'JoinMeetingMutation failed')
        if (isMounted) fetchMeeting()
      }
    })
    return () => {
      isMounted = false
      // hands over any messages still held for a join that will not finish here
      resolveJoined()
      window.clearTimeout(ackTimeout)
      atmosphere.subscriptionAckHandlers.delete(subKey)
      releaseMeetingSubscription?.()
    }
  }, [meetingId])
  return queryRef
}

export default useJoinedMeetingQuery

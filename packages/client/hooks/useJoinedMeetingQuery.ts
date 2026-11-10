import {useEffect} from 'react'
import {fetchQuery, useQueryLoader} from 'react-relay'
import {useNavigate} from 'react-router'
import meetingSelectorQuery, {
  type MeetingSelectorQuery
} from '../__generated__/MeetingSelectorQuery.graphql'
import Atmosphere from '../Atmosphere'
import JoinMeetingMutation from '../mutations/JoinMeetingMutation'
import MeetingSubscription from '../subscriptions/MeetingSubscription'
import useAtmosphere from './useAtmosphere'

// Joins, subscribes, and fetches the meeting only once the server acknowledges that the subscription is listening.
// The subscription's messages wait until that fetch is in the store, so none are missed or overwritten.
// A reconnect makes the server acknowledge the subscription again, which fetches the meeting again.
const useJoinedMeetingQuery = (meetingId: string | undefined) => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const [queryRef, loadQuery] = useQueryLoader<MeetingSelectorQuery>(meetingSelectorQuery)
  useEffect(() => {
    if (!meetingId) return
    const variables = {meetingId}
    const queryKey = `useJoinedMeetingQuery:${meetingId}`
    const subKey = Atmosphere.getKey(MeetingSubscription.key, variables)
    let isMounted = true
    const fetchMeeting = (releaseSubscription?: () => void) => {
      fetchQuery<MeetingSelectorQuery>(atmosphere, meetingSelectorQuery, variables, {
        fetchPolicy: 'network-only'
      }).subscribe({
        complete: () => {
          if (isMounted) loadQuery(variables, {fetchPolicy: 'store-only'})
          releaseSubscription?.()
        },
        error: () => {
          releaseSubscription?.()
          if (isMounted) loadQuery(variables, {fetchPolicy: 'network-only'})
        }
      })
    }
    let ackTimeout: number | undefined
    const fetchWhileHoldingSubscription = () => {
      window.clearTimeout(ackTimeout)
      fetchMeeting(atmosphere.holdSubscription(subKey))
    }
    const subscribe = () => {
      const isAlreadySubscribed = Boolean(atmosphere.subscriptions[subKey])
      atmosphere.subscriptionAckHandlers.set(subKey, fetchWhileHoldingSubscription)
      atmosphere.registerQuery(queryKey, MeetingSubscription, variables, {navigate}).catch(() => {
        /*ignore*/
      })
      if (isAlreadySubscribed) fetchWhileHoldingSubscription()
      // a socket server older than this client never acknowledges a subscription
      else ackTimeout = window.setTimeout(() => fetchMeeting(), 5000)
    }
    JoinMeetingMutation(atmosphere, variables, {
      onCompleted: (response) => {
        if (!isMounted) return
        // not on the team, or the meeting ended before the viewer joined: nothing to subscribe to
        if (response.joinMeeting?.JoinMeetingMutation_meeting) subscribe()
        else fetchMeeting()
      },
      onError: () => {
        if (isMounted) fetchMeeting()
      }
    })
    return () => {
      isMounted = false
      window.clearTimeout(ackTimeout)
      atmosphere.subscriptionAckHandlers.delete(subKey)
      atmosphere.scheduleUnregisterQuery(queryKey, 5000)
    }
  }, [meetingId])
  return queryRef
}

export default useJoinedMeetingQuery

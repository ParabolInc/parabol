import {fetchQuery} from 'react-relay'
import meetingSelectorQuery, {
  type MeetingSelectorQuery
} from '../__generated__/MeetingSelectorQuery.graphql'
import Atmosphere from '../Atmosphere'
import JoinMeetingMutation from '../mutations/JoinMeetingMutation'
import MeetingSubscription from '../subscriptions/MeetingSubscription'
import type {NavigateFn} from '../types/relayMutations'
import {addBreadcrumb} from '../utils/clientBreadcrumbs'
import type {QueryRefs} from './queryRefs'

// Joins, subscribes, and fetches the meeting only once the server acknowledges that the subscription is listening.
// The subscription's messages wait until that fetch is in the store, so none are missed or overwritten.
// A reconnect makes the server acknowledge the subscription again, which fetches the meeting again.
// A viewer the store already knows is in the meeting, like the one who just started it, subscribes while joining.
// The meeting renders from the first payload: deferred fragments suspend until their own payloads arrive,
// and subscription messages stay held until the last one.
// The viewer stays joined until the signal aborts.
const joinMeeting = async (
  atmosphere: Atmosphere,
  router: {navigate: NavigateFn},
  queryRefs: QueryRefs,
  meetingId: string,
  signal: AbortSignal
) => {
  signal.throwIfAborted()
  const variables = {meetingId}
  const subKey = Atmosphere.getKey(MeetingSubscription.key, variables)
  let hasLeft = false
  let resolveFetched: (isFetched: boolean) => void = () => {}
  const fetched = new Promise<boolean>((resolve) => {
    resolveFetched = resolve
  })
  const fetchMeeting = (releaseSubscription?: () => void) => {
    fetchQuery<MeetingSelectorQuery>(atmosphere, meetingSelectorQuery, variables, {
      fetchPolicy: 'network-only'
    }).subscribe({
      next: () => resolveFetched(true),
      complete: () => {
        addBreadcrumb(
          'operation',
          hasLeft ? 'MeetingSelectorQuery fetched after leaving' : 'MeetingSelectorQuery fetched'
        )
        resolveFetched(true)
        releaseSubscription?.()
      },
      error: () => {
        addBreadcrumb(
          'operation',
          hasLeft
            ? 'MeetingSelectorQuery fetch failed after leaving'
            : 'MeetingSelectorQuery fetch failed'
        )
        releaseSubscription?.()
        resolveFetched(false)
      }
    })
  }
  // the fetched meeting must include the viewer's own join
  let resolveJoined = () => {}
  const joined = new Promise<void>((resolve) => {
    resolveJoined = resolve
  })
  const fetchOnceJoined = (releaseSubscription?: () => void) => {
    joined.then(() => (hasLeft ? releaseSubscription?.() : fetchMeeting(releaseSubscription)))
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
      router,
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
  const leave = () => {
    if (hasLeft) return
    hasLeft = true
    // hands over any messages still held for a join that will not finish here
    resolveJoined()
    window.clearTimeout(ackTimeout)
    if (atmosphere.subscriptionAckHandlers.get(subKey) === fetchWhileHoldingSubscription) {
      atmosphere.subscriptionAckHandlers.delete(subKey)
    }
    releaseMeetingSubscription?.()
  }
  signal.addEventListener('abort', leave)
  const isViewerMeetingMember = Boolean(
    atmosphere.getStore().getSource().get(meetingId)?.viewerMeetingMember
  )
  if (isViewerMeetingMember) subscribe()
  JoinMeetingMutation(atmosphere, variables, {
    onCompleted: (response) => {
      if (hasLeft) return
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
      if (!hasLeft) fetchMeeting()
    }
  })
  try {
    // a failed fetch loads from the network again, so its error reaches the page
    const isFetched = await fetched
    return await queryRefs.load<MeetingSelectorQuery>(meetingSelectorQuery, variables, {
      fetchPolicy: isFetched ? 'store-only' : 'network-only'
    })
  } catch (error) {
    leave()
    throw error
  }
}

export default joinMeeting

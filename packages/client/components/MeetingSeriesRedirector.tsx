import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import {MeetingSeriesRedirectorQuery} from '../__generated__/MeetingSeriesRedirectorQuery.graphql'
interface Props {
  meetingId: string
  queryRef: PreloadedQuery<MeetingSeriesRedirectorQuery>
}

const MeetingSeriesRedirector = (props: Props) => {
  const {queryRef, meetingId} = props

  const data = usePreloadedQuery<MeetingSeriesRedirectorQuery>(
    graphql`
      query MeetingSeriesRedirectorQuery($meetingId: ID!) {
        viewer {
          isConnected
          canAccessMeeting: canAccess(entity: Meeting, id: $meetingId)
          meeting(meetingId: $meetingId) {
            ... on TeamPromptMeeting {
              meetingSeries {
                mostRecentMeeting {
                  id
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  )

  const {viewer} = data
  const {meeting, canAccessMeeting} = viewer

  if (!canAccessMeeting && !meeting) {
    return (
      <Redirect
        to={{
          pathname: `/invitation-required`,
          search: `?redirectTo=${encodeURIComponent(
            window.location.pathname
          )}&meetingId=${meetingId}`
        }}
      />
    )
  } else if (!meeting) {
    // We know that a null meeting while we should have access is an error.
    // We could render here an error component here. For that we'd need to create an error, store it in state, log it to Sentry and render the component.
    // This is pretty much what the ErrorBoundary will do if we just throw here.
    throw new Error('Meeting was null')
  } else {
    const {meetingSeries} = meeting
    if (!meetingSeries) {
      return <Redirect to={`/meet/${meetingId}`} />
    }
    const {mostRecentMeeting} = meetingSeries
    const {id: activeMeetingId} = mostRecentMeeting

    return <Redirect to={`/meet/${activeMeetingId}`} />
  }
}

export default MeetingSeriesRedirector

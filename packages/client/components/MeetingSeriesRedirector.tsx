import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useRouter from '../hooks/useRouter'
import {MeetingSeriesRedirectorQuery} from '../__generated__/MeetingSeriesRedirectorQuery.graphql'
interface Props {
  meetingSeriesId: string
  queryRef: PreloadedQuery<MeetingSeriesRedirectorQuery>
}

const MeetingSeriesRedirector = (props: Props) => {
  const {queryRef, meetingSeriesId} = props

  const {history} = useRouter()
  const data = usePreloadedQuery<MeetingSeriesRedirectorQuery>(
    graphql`
      query MeetingSeriesRedirectorQuery($meetingSeriesId: ID!) {
        viewer {
          isConnected
          meetingSeries(meetingSeriesId: $meetingSeriesId) {
            mostRecentMeeting {
              id
            }
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const {viewer} = data
  const {meetingSeries} = viewer

  useEffect(() => {
    if (!meetingSeries) {
      history.replace({
        pathname: `/invitation-required`,
        search: `?redirectTo=${encodeURIComponent(
          window.location.pathname
        )}&meetingSeriesId=${meetingSeriesId}`
      })
    } else {
      const {mostRecentMeeting} = meetingSeries
      const {id: meetingId} = mostRecentMeeting

      history.replace({
        pathname: `/meet/${meetingId}`
      })
    }
  }, [])

  return null
}

export default MeetingSeriesRedirector

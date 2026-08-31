import graphql from 'babel-plugin-relay/macro'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {parseMeetingSeriesIdFromSlug} from 'parabol-client/shared/meetingSeriesSlug'
import {Suspense} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Navigate, useParams} from 'react-router'
import type {MeetingSeriesAttendQuery} from '../__generated__/MeetingSeriesAttendQuery.graphql'
import meetingSeriesAttendQuery from '../__generated__/MeetingSeriesAttendQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import MeetingSeriesTeamPicker from './MeetingSeriesTeamPicker'

const Inner = (props: {queryRef: PreloadedQuery<MeetingSeriesAttendQuery>; teamId?: string}) => {
  const {queryRef, teamId} = props
  const data = usePreloadedQuery<MeetingSeriesAttendQuery>(
    graphql`
      query MeetingSeriesAttendQuery($meetingSeriesId: ID!) {
        viewer {
          meetingSeries(meetingSeriesId: $meetingSeriesId) {
            title
            activeMeetings {
              id
              teamId
              team {
                name
              }
            }
          }
        }
      }
    `,
    queryRef
  )
  const {meetingSeries} = data.viewer
  // A group can cover several teams under one calendar invite, so the link often names no team.
  // activeMeetings spans the group & the server scopes it to the teams the viewer is on
  const joinableMeetings = meetingSeries?.activeMeetings ?? []
  const requestedMeeting = teamId
    ? joinableMeetings.find((meeting) => meeting.teamId === teamId)
    : undefined
  const soleMeeting = joinableMeetings.length === 1 ? joinableMeetings[0] : undefined
  const meeting = requestedMeeting ?? soleMeeting
  if (meeting) {
    return <Navigate replace to={`/meet/${meeting.id}`} />
  }
  // an absent or unjoinable teamId with several options is a choice, not an error
  if (joinableMeetings.length > 1) {
    return (
      <MeetingSeriesTeamPicker
        seriesTitle={meetingSeries?.title ?? 'Meeting'}
        meetings={joinableMeetings.map(({id, team}) => ({id, teamName: team?.name ?? 'Your team'}))}
      />
    )
  }
  return <Navigate replace to='/meetings' />
}

const MeetingSeriesAttend = () => {
  const {slug, teamId} = useParams()
  const rawId = slug ? parseMeetingSeriesIdFromSlug(slug) : null
  const meetingSeriesId = rawId != null ? MeetingSeriesId.join(rawId) : null
  const queryRef = useQueryLoaderNow<MeetingSeriesAttendQuery>(meetingSeriesAttendQuery, {
    meetingSeriesId: meetingSeriesId ?? ''
  })
  if (!meetingSeriesId) return <Navigate replace to='/meetings' />
  return (
    <Suspense fallback={''}>{queryRef && <Inner queryRef={queryRef} teamId={teamId} />}</Suspense>
  )
}

export default MeetingSeriesAttend

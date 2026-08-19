import graphql from 'babel-plugin-relay/macro'
import {type RefObject, useRef} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {SpotlightResultsQuery} from '~/__generated__/SpotlightResultsQuery.graphql'
import useResultsHeight from '~/hooks/useResultsHeight'
import useGroupMatrix from '../hooks/useGroupMatrix'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import SpotlightResultsEmptyState from './SpotlightResultsEmptyState'

interface Props {
  phaseRef: RefObject<HTMLDivElement>
  queryRef: PreloadedQuery<SpotlightResultsQuery>
}

const SpotlightResults = (props: Props) => {
  const {phaseRef, queryRef} = props

  const data = usePreloadedQuery<SpotlightResultsQuery>(
    graphql`
      query SpotlightResultsQuery($reflectionGroupId: ID!, $searchQuery: String!, $meetingId: ID!) {
        viewer {
          similarReflectionGroups(
            reflectionGroupId: $reflectionGroupId
            searchQuery: $searchQuery
          ) {
            id
            ...ReflectionGroup_reflectionGroup
          }
          meeting(meetingId: $meetingId) {
            ... on RetrospectiveMeeting {
              ...DraggableReflectionCard_meeting @alias
              ...ReflectionGroup_meeting @alias
              id
              teamId
              localPhase {
                phaseType
              }
              localStage {
                isComplete
                phaseType
              }
              phases {
                phaseType
                stages {
                  isComplete
                  phaseType
                }
              }
              spotlightGroup {
                id
                ...ReflectionGroup_reflectionGroup
              }
            }
          }
        }
      }
    `,
    queryRef
  )
  const {viewer} = data
  const {meeting, similarReflectionGroups} = viewer
  const reflectionGroupMeetingRef = meeting?.ReflectionGroup_meeting
  const resultsRef = useRef<HTMLDivElement>(null)
  const groupMatrix = useGroupMatrix(similarReflectionGroups, resultsRef, phaseRef)
  const scrollHeight = useResultsHeight(resultsRef)

  return (
    <div className='h-full w-full overflow-hidden bg-surface-well pt-10 pb-6'>
      {!similarReflectionGroups.length || !reflectionGroupMeetingRef ? (
        <SpotlightResultsEmptyState height={scrollHeight} />
      ) : (
        <div
          className='flex min-h-44 w-full justify-center overflow-auto'
          style={{height: scrollHeight}}
          ref={resultsRef}
        >
          {groupMatrix.map((row) => (
            <div className='mx-2 flex h-fit max-w-80 flex-col' key={`row-${row[0]?.id}`}>
              {row.map((group) => (
                <ReflectionGroup
                  key={group.id}
                  meetingRef={reflectionGroupMeetingRef}
                  phaseRef={phaseRef}
                  reflectionGroupRef={group}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SpotlightResults

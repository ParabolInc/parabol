import graphql from 'babel-plugin-relay/macro'
import {readInlineData, useLazyLoadQuery} from 'react-relay'
import {useSpotlightResultsLocalQuery} from './../__generated__/useSpotlightResultsLocalQuery.graphql'
import {useSpotlightResults_meeting$key} from './../__generated__/useSpotlightResults_meeting.graphql'

const useSpotlightResults = (meetingRef: useSpotlightResults_meeting$key) => {
  const meeting = readInlineData(
    graphql`
      fragment useSpotlightResults_meeting on RetrospectiveMeeting @inline {
        spotlightGroup {
          id
        }
        spotlightSearchQuery
      }
    `,
    meetingRef
  )
  const {spotlightGroup, spotlightSearchQuery = ''} = meeting
  const spotlightGroupId = spotlightGroup?.id ?? ''

  const spotlightSearchResults = useLazyLoadQuery<useSpotlightResultsLocalQuery>(
    graphql`
      query useSpotlightResultsLocalQuery($reflectionGroupId: ID!, $searchQuery: String!) {
        viewer {
          similarReflectionGroups(
            reflectionGroupId: $reflectionGroupId
            searchQuery: $searchQuery
          ) {
            id
            reflections {
              id
              isViewerDragging
            }
          }
        }
      }
    `,
    {
      reflectionGroupId: spotlightGroupId || '',
      searchQuery: spotlightSearchQuery || ''
    },
    {fetchPolicy: 'store-only'}
  )
  const {viewer} = spotlightSearchResults
  const {similarReflectionGroups} = viewer
  return similarReflectionGroups
}

export default useSpotlightResults

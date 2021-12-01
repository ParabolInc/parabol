import {
  useSpotlightResultsLocalQuery,
  useSpotlightResultsLocalQueryResponse
} from './../__generated__/useSpotlightResultsLocalQuery.graphql'
import {useLazyLoadQuery} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'

type ResultGroups = useSpotlightResultsLocalQueryResponse['viewer']['similarReflectionGroups']

const useSpotlightResults = (
  spotlightGroupId?: string,
  searchQuery?: string | null,
  getReflections?: boolean
): ResultGroups | undefined => {
  const spotlightSearchResults = useLazyLoadQuery<useSpotlightResultsLocalQuery>(
    graphql`
      query useSpotlightResultsLocalQuery(
        $reflectionGroupId: ID!
        $searchQuery: String!
        $getReflections: Boolean
      ) {
        viewer {
          similarReflectionGroups(
            reflectionGroupId: $reflectionGroupId
            searchQuery: $searchQuery
          ) {
            id
            reflections @include(if: $getReflections) {
              id
              isViewerDragging
            }
          }
        }
      }
    `,
    {
      reflectionGroupId: spotlightGroupId || '',
      searchQuery: searchQuery || '',
      getReflections
    },
    {fetchPolicy: 'store-only'}
  )
  const {viewer} = spotlightSearchResults
  const {similarReflectionGroups} = viewer
  return similarReflectionGroups
}

export default useSpotlightResults

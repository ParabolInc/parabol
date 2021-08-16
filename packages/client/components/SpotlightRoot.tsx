import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer, QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import ErrorComponent from './ErrorComponent/ErrorComponent'
import SpotlightModal from './SpotlightModal'

const query = graphql`
  query SpotlightRootQuery($meetingId: ID!, $reflectionId: ID, $searchQuery: String!) {
    viewer {
      ...SpotlightModal_viewer
    }
  }
`

interface Props {
  closeSpotlight: () => void
  meeting: any
  flipRef: (instance: HTMLDivElement) => void
}

const SpotlightRoot = (props: Props) => {
  const {closeSpotlight, meeting, flipRef} = props
  const {id: meetingId, spotlightReflection} = meeting
  const reflectionId = spotlightReflection?.id
  const searchQuery = ''
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      variables={{meetingId, reflectionId, searchQuery}}
      environment={atmosphere}
      query={query}
      fetchPolicy={'store-or-network' as any}
      render={({props, error}) => {
        const viewer = (props as any)?.viewer ?? null
        if (error) return <ErrorComponent error={error} eventId={''} />
        return (
          <SpotlightModal
            closeSpotlight={closeSpotlight}
            meeting={meeting}
            flipRef={flipRef}
            viewer={viewer}
          />
        )
      }}
    />
  )
}

export default createFragmentContainer(SpotlightRoot, {
  meeting: graphql`
    fragment SpotlightRoot_meeting on RetrospectiveMeeting {
      ...SpotlightModal_meeting
      id
      spotlightReflection {
        id
      }
    }
  `
})

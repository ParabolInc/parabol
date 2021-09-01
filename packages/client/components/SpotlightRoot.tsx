import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer, QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import ErrorComponent from './ErrorComponent/ErrorComponent'
import SpotlightModal from './SpotlightModal'
import {SpotlightRoot_meeting} from '~/__generated__/SpotlightRoot_meeting.graphql'

const query = graphql`
  query SpotlightRootQuery($reflectionId: ID, $searchQuery: String!) {
    viewer {
      ...SpotlightModal_viewer
    }
  }
`

interface Props {
  closeSpotlight: () => void
  meeting: SpotlightRoot_meeting
  flipRef: (instance: HTMLDivElement) => void
}

const SpotlightRoot = (props: Props) => {
  const {closeSpotlight, meeting, flipRef} = props
  const {spotlightReflection} = meeting
  const searchQuery = '' // TODO: implement searchQuery
  const atmosphere = useAtmosphere()
  const reflectionIdRef = useRef('')
  const nextReflectionId = spotlightReflection?.id ?? ''
  if (nextReflectionId) {
    reflectionIdRef.current = nextReflectionId
  }
  return (
    <QueryRenderer
      variables={{reflectionId: reflectionIdRef.current, searchQuery}}
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

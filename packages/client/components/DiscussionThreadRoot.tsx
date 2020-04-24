import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import renderQuery from '../utils/relay/renderQuery'
import DiscussionThread from './DiscussionThread'

const query = graphql`
  query DiscussionThreadRootQuery($meetingId: ID!, $reflectionGroupId: ID!) {
    viewer {
      ...DiscussionThread_viewer
    }
  }
`

interface Props {
  meetingId: string
  reflectionGroupId: string
}

const DiscussionThreadRoot = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {meetingId, reflectionGroupId} = props
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{meetingId, reflectionGroupId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(DiscussionThread)}
    />
  )
}

export default DiscussionThreadRoot

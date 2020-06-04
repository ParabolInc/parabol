import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import renderQuery from '../utils/relay/renderQuery'
import DiscussionThread from './DiscussionThread'

const query = graphql`
  query DiscussionThreadRootQuery($meetingId: ID!, $threadSourceId: ID!) {
    viewer {
      ...DiscussionThread_viewer
    }
  }
`

interface Props {
  meetingId: string
  threadSourceId: string
}

const DiscussionThreadRoot = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {meetingId, threadSourceId} = props
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{meetingId, threadSourceId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(DiscussionThread)}
    />
  )
}

export default DiscussionThreadRoot

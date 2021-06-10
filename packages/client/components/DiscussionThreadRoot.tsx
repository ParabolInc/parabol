import graphql from 'babel-plugin-relay/macro'
import React, {RefObject} from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import renderQuery from '../utils/relay/renderQuery'
import DiscussionThread from './DiscussionThread'
import {DiscussionThreadables} from './DiscussionThreadList'
const query = graphql`
  query DiscussionThreadRootQuery($discussionId: ID!) {
    viewer {
      ...DiscussionThread_viewer
    }
  }
`

interface Props {
  meetingContentRef?: RefObject<HTMLDivElement>
  discussionId: string
  isReadOnly: boolean
  allowedThreadables: DiscussionThreadables[]
  width?: string
}

const DiscussionThreadRoot = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {allowedThreadables, isReadOnly, meetingContentRef, discussionId, width} = props
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{discussionId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(DiscussionThread, {
        props: {allowedThreadables, isReadOnly, meetingContentRef, width}
      })}
    />
  )
}

export default DiscussionThreadRoot

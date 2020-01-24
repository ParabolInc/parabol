import React, {useEffect} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import renderQuery from '../utils/relay/renderQuery'
import MeetingSelector from './MeetingSelector'
import SetAppLocationMutation from 'mutations/SetAppLocationMutation'

// Changing the name here requires a change to getLastSeenAtURL.ts
const query = graphql`
  query MeetingRootQuery($meetingId: ID!) {
    viewer {
      ...MeetingSelector_viewer
    }
  }
`

const MeetingRoot = () => {
  const atmosphere = useAtmosphere()
  const {history, match} = useRouter<{meetingId: string}>()
  const {params} = match
  const {meetingId} = params
  useEffect(() => {
    if (!meetingId) return
    const location = `/meet/${meetingId}`
    SetAppLocationMutation(atmosphere, {location})
    return () => {
      SetAppLocationMutation(atmosphere, {location: null})
    }
  }, [])
  useEffect(() => {
    if (!meetingId) {
      history.replace('/me')
    }
  }, [])
  if (!meetingId) return null
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{meetingId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(MeetingSelector, {props: {meetingId}})}
    />
  )
}

export default MeetingRoot

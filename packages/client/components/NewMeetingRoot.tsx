import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import renderQuery from '../utils/relay/renderQuery'
import NewMeeting from './NewMeeting'

const query = graphql`
  query NewMeetingRootQuery {
    viewer {
      ...NewMeeting_viewer
    }
  }
`

const NewMeetingRoot = () => {
  const atmosphere = useAtmosphere()
  const {match} = useRouter<{teamId: string}>()
  const {params} = match
  const {teamId} = params
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(NewMeeting, {props: {teamId}})}
    />
  )
}

export default NewMeetingRoot

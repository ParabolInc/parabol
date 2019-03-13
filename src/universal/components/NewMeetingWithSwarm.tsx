import React from 'react'
import {RouteComponentProps} from 'react-router'
import NewMeeting from './NewMeeting'
import useSwarm from '../hooks/useSwarm'

interface Props extends RouteComponentProps<{teamId: string}> {}

export default (props: Props) => {
  const {
    match: {
      params: {teamId}
    }
  } = props
  const {streams, swarm} = useSwarm(teamId)
  // @ts-ignore
  return <NewMeeting {...props} streams={streams} swarm={swarm} />
}

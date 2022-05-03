import React from 'react'
import {PreloadedQuery} from 'react-relay'
import {TeamContainerQuery} from '../../../__generated__/TeamContainerQuery.graphql'
import TeamContainer from '../containers/Team/TeamContainer'

interface Props {
  prepared: {
    queryRef: PreloadedQuery<TeamContainerQuery>
  }
  teamId: string
}

const TeamRoot = (props: Props) => {
  const {
    prepared: {queryRef},
    teamId
  } = props
  return <TeamContainer queryRef={queryRef} teamId={teamId} />
}

export default TeamRoot

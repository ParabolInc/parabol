import React from 'react'
import {RouteComponentProps} from 'react-router'
import ArchiveTaskRoot, {ArchiveTaskRootProps} from '~/components/ArchiveTaskRoot'

interface Props extends RouteComponentProps<{teamId: string}>, ArchiveTaskRootProps {
}

const TeamArchiveRoot = ({match, team}: Props) => {
  const {
    params: {teamId}
  } = match
  return (
    <ArchiveTaskRoot teamId={teamId} team={team} showHeader={true} />
  )
}

export default TeamArchiveRoot

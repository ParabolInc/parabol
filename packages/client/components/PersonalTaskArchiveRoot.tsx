import React from 'react'
import ArchiveTaskRoot, {ArchiveTaskRootProps} from './ArchiveTaskRoot'

interface Props extends ArchiveTaskRootProps {
}

const PersonalTaskArchiveRoot = ({teamId, team}: Props) => {
  return (
    <ArchiveTaskRoot teamId={teamId} team={team ?? null} showHeader={false} />
  )
}

export default PersonalTaskArchiveRoot

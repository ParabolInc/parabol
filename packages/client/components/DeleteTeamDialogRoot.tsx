import React, {Suspense} from 'react'
import DeleteTeamDialog from './DeleteTeamDialog'
import {Loader} from '../utils/relay/renderLoader'

interface Props {
  onClose: () => void
  onDeleteTeam: (teamId: string) => void
  teamId: string
  teamName: string
  teamOrgId: string
}

const DeleteTeamDialogRoot = (props: Props) => {
  const {onClose, onDeleteTeam, teamId, teamName, teamOrgId} = props

  return (
    <Suspense fallback={<Loader />}>
      <DeleteTeamDialog
        onDeleteTeam={onDeleteTeam}
        isOpen={true}
        onClose={onClose}
        teamId={teamId}
        teamName={teamName}
        teamOrgId={teamOrgId}
      />
    </Suspense>
  )
}

export default DeleteTeamDialogRoot

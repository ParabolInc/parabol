import React, {Suspense} from 'react'
import AddTeamDialog from './AddTeamDialog'
import {renderLoader} from '../utils/relay/renderLoader'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import addTeamDialogQuery, {AddTeamDialogQuery} from '../__generated__/AddTeamDialogQuery.graphql'

interface Props {
  onClose: () => void
  onAddTeam: (teamId: string) => void
}

const AddTeamDialogRoot = (props: Props) => {
  const {onClose, onAddTeam} = props

  const queryRef = useQueryLoaderNow<AddTeamDialogQuery>(addTeamDialogQuery, {}, 'network-only')

  return (
    <Suspense fallback={renderLoader()}>
      {queryRef && (
        <AddTeamDialog onAddTeam={onAddTeam} isOpen={true} onClose={onClose} queryRef={queryRef} />
      )}
    </Suspense>
  )
}

export default AddTeamDialogRoot

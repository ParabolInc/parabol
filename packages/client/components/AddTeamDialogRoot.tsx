import {Suspense, useState} from 'react'
import addTeamDialogQuery, {
  type AddTeamDialogQuery
} from '../__generated__/AddTeamDialogQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import getInviteeMeetingsWindow from '../utils/getInviteeMeetingsWindow'
import {Loader} from '../utils/relay/renderLoader'
import AddTeamDialog from './AddTeamDialog'

interface Props {
  isOpen: boolean
  onClose: () => void
  onTeamAdded: (teamId: string) => void
  orgId: string
}

const AddTeamDialogRoot = (props: Props) => {
  const {isOpen, onClose, onTeamAdded, orgId} = props

  const [meetingsWindow] = useState(getInviteeMeetingsWindow)
  const queryRef = useQueryLoaderNow<AddTeamDialogQuery>(addTeamDialogQuery, {
    orgId,
    ...meetingsWindow
  })

  return (
    <Suspense fallback={<Loader />}>
      {queryRef && (
        <AddTeamDialog
          onTeamAdded={onTeamAdded}
          isOpen={isOpen}
          onClose={onClose}
          queryRef={queryRef}
        />
      )}
    </Suspense>
  )
}

export default AddTeamDialogRoot

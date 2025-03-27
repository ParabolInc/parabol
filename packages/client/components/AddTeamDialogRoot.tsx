import {Suspense} from 'react'
import addTeamDialogQuery, {AddTeamDialogQuery} from '../__generated__/AddTeamDialogQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import {Loader} from '../utils/relay/renderLoader'
import AddTeamDialog from './AddTeamDialog'

interface Props {
  onClose: () => void
  onTeamAdded: (teamId: string) => void
  orgId: string
}

const AddTeamDialogRoot = (props: Props) => {
  const {onClose, onTeamAdded, orgId} = props

  const queryRef = useQueryLoaderNow<AddTeamDialogQuery>(addTeamDialogQuery, {orgId})

  return (
    <Suspense fallback={<Loader />}>
      {queryRef && (
        <AddTeamDialog
          onTeamAdded={onTeamAdded}
          isOpen={true}
          onClose={onClose}
          queryRef={queryRef}
        />
      )}
    </Suspense>
  )
}

export default AddTeamDialogRoot

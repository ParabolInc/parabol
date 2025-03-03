import {useDispatch} from 'react-redux'
import {openLinkTeamModal} from '../reducers'
import Modal from './Modal'

type Props = {
  title: string
  handleClose: () => void
}
const NoLinkedTeamsModal = ({title, handleClose}: Props) => {
  const dispatch = useDispatch()

  const handleLink = () => {
    dispatch(openLinkTeamModal())
    handleClose()
  }

  return (
    <Modal
      title={title}
      commitButtonLabel='Link team'
      handleClose={handleClose}
      handleCommit={handleLink}
    >
      <p>There are no Parabol teams linked to this channel yet.</p>
    </Modal>
  )
}

export default NoLinkedTeamsModal

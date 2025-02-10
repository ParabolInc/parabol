import {Modal as M} from 'react-bootstrap'
import {useSelector} from 'react-redux'

import {getAssetsUrl} from '../selectors'

export type ModalProps = {
  title: string
  commitButtonLabel: string
  handleCommit: () => void
  handleClose: () => void
  children?: React.ReactNode
}

const Modal = (props: ModalProps) => {
  const {title, commitButtonLabel, handleCommit, handleClose, children} = props

  const assetsPath = useSelector(getAssetsUrl)

  return (
    <M
      dialogClassName='modal--scroll'
      show={true}
      onHide={handleClose}
      onExited={handleClose}
      bsSize='large'
      backdrop='static'
    >
      <M.Header closeButton={true}>
        <M.Title>
          <img width={36} height={36} className='mr-3' src={`${assetsPath}/parabol.png`} />
          {title}
        </M.Title>
      </M.Header>
      <M.Body>{children}</M.Body>
      <M.Footer>
        <button className='btn btn-tertiary cancel-button' onClick={handleClose}>
          Cancel
        </button>
        <button className='btn btn-primary save-button' onClick={handleCommit}>
          {commitButtonLabel}
        </button>
      </M.Footer>
    </M>
  )
}

export default Modal

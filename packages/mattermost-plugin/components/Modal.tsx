import {Modal as M} from 'react-bootstrap'
import {useSelector} from 'react-redux'

import {getAssetsUrl} from '../selectors'
import LoadingSpinner from './LoadingSpinner'

export type ModalProps = {
  title: string
  commitButtonLabel: string
  handleCommit?: () => void
  handleClose: () => void
  children?: React.ReactNode
  error?: string
  isLoading?: boolean
}

const Modal = (props: ModalProps) => {
  const {title, commitButtonLabel, handleCommit, handleClose, children, error, isLoading} = props

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
        {error && <div className='error-text flex-grow'>{error}</div>}
        {isLoading && <LoadingSpinner className='flex-grow' text='Loading...' />}
        {handleCommit ? (
          <>
            <button className='btn btn-tertiary cancel-button' onClick={handleClose}>
              Cancel
            </button>
            <button
              className='btn btn-primary save-button'
              disabled={isLoading}
              onClick={handleCommit}
            >
              {commitButtonLabel}
            </button>
          </>
        ) : (
          <>
            <button className='btn btn-primary svae-button' onClick={handleClose}>
              {commitButtonLabel}
            </button>
          </>
        )}
      </M.Footer>
    </M>
  )
}

export default Modal

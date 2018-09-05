import {Component, ReactNode} from 'react'
import {createPortal} from 'react-dom'

/*
 * A lightweight wrapper around React16s createPortal function
 * Listens for an ESC key press or a mousedown outside the modal
 * Takes an isOpen prop. For delayed DOM removal, (like animations) use complex isOpen logic in the parent
 */

interface Props {
  isOpen?: boolean | null

  onClose? (event: KeyboardEvent | MouseEvent | TouchEvent): void

  onOpen? (): void

  clickToClose?: boolean
  escToClose?: boolean
  children: ReactNode
}

class Modal extends Component<Props> {
  el?: Element

  componentWillMount () {
    if (this.props.isOpen) {
      this.setup()
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    const {isOpen} = nextProps
    if (isOpen === this.props.isOpen) return
    if (isOpen) {
      this.setup()
    } else {
      this.teardown()
    }
  }

  componentWillUnmount () {
    this.teardown()
  }

  setup () {
    this.el = document.createElement('div')
    this.el.id = 'portal'
    this.setState({
      isOpen: true
    })
    const {clickToClose, escToClose, onOpen} = this.props
    if (clickToClose) {
      document.addEventListener('mousedown', this.handleDocumentClick)
      document.addEventListener('touchstart', this.handleDocumentClick)
    }
    if (escToClose) {
      document.addEventListener('keydown', this.handleKeydown)
    }
    document.body.appendChild(this.el)
    onOpen && onOpen()
  }

  teardown () {
    if (this.el && document.body.contains(this.el)) {
      document.body.removeChild(this.el)
      document.removeEventListener('mousedown', this.handleDocumentClick)
      document.removeEventListener('touchstart', this.handleDocumentClick)
      document.removeEventListener('keydown', this.handleKeydown)
    }
  }

  handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      const {onClose} = this.props
      onClose && onClose(e)
    }
  }
  handleDocumentClick = (e: MouseEvent | TouchEvent) => {
    if (!this.el) return
    if (!this.el.contains(e.target as Node)) {
      const {onClose} = this.props
      onClose && onClose(e)
    }
  }

  render () {
    const {children, isOpen} = this.props
    return isOpen ? createPortal(children, this.el!) : null
  }
}

export default Modal

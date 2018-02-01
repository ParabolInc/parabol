import {createPortal} from 'react-dom';
import {Component} from 'react';
import PropTypes from 'prop-types';

/*
 * A lightweight wrapper around React16s createPortal function
 * Listens for an ESC key press or a click outside the modal
 */
class Modal extends Component {
  static propTypes = {
    onClose: PropTypes.func,
    clickToClose: PropTypes.bool,
    escToClose: PropTypes.bool,
    children: PropTypes.element.isRequired
  };

  constructor(props) {
    super(props);
    this.el = document.createElement('div');
    this.el.id = 'portal';
  }

  componentWillMount() {
    const {clickToClose, escToClose} = this.props;
    if (clickToClose) {
      document.addEventListener('click', this.handleDocumentClick);
      document.addEventListener('touchstart', this.handleDocumentClick);
    }
    if (escToClose) {
      document.addEventListener('keydown', this.handleKeydown);
    }
    document.body.appendChild(this.el);
  }

  componentWillUnmount() {
    document.body.removeChild(this.el);
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('touchstart', this.handleDocumentClick);
    document.removeEventListener('keydown', this.handleKeydown);
  }

  handleKeydown = (e) => {
    if (e.key === 'Escape') {
      const {onClose} = this.props;
      onClose();
    }
  };
  handleDocumentClick = (e) => {
    if (!this.el.contains(e.target)) {
      const {onClose} = this.props;
      onClose();
    }
  };

  render() {
    const {children} = this.props;
    return createPortal(
      children,
      this.el
    );
  }
}

export default Modal;

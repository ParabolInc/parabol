import {createPortal} from 'react-dom';
import {Component} from 'react';
import PropTypes from 'prop-types';

/*
 * A lightweight wrapper around React16s createPortal function
 * Listens for an ESC key press or a click outside the modal
 * Takes an isOpen prop. For delayed DOM removal, (like animations) use complex isOpen logic in the parent
 */
class Modal extends Component {
  static propTypes = {
    onClose: PropTypes.func,
    clickToClose: PropTypes.bool,
    escToClose: PropTypes.bool,
    children: PropTypes.element.isRequired,
    isOpen: PropTypes.bool
  };

  componentWillMount() {
    if (this.props.isOpen) {
      this.setup();
    }
  }

  componentWillReceiveProps(nextProps) {
    const {isOpen} = nextProps;
    if (isOpen === this.props.isOpen) return;
    if (isOpen) {
      this.setup();
    } else {
      this.teardown();
    }
  }

  componentWillUnmount() {
    this.teardown();
  }

  setup() {
    this.el = document.createElement('div');
    this.el.id = 'portal';
    this.setState({
      isOpen: true
    });
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

  teardown() {
    if (this.el) {
      document.body.removeChild(this.el);
      document.removeEventListener('click', this.handleDocumentClick);
      document.removeEventListener('touchstart', this.handleDocumentClick);
      document.removeEventListener('keydown', this.handleKeydown);
    }
  }

  handleKeydown = (e) => {
    if (e.key === 'Escape') {
      const {onClose} = this.props;
      onClose(e);
    }
  };
  handleDocumentClick = (e) => {
    if (!this.el.contains(e.target)) {
      const {onClose} = this.props;
      onClose(e);
    }
  };

  render() {
    const {children, isOpen} = this.props;
    return isOpen ? createPortal(
      children,
      this.el
    ) : null;
  }
}

export default Modal;

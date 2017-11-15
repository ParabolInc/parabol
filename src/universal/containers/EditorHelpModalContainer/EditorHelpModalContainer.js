import PropTypes from 'prop-types';
import React, {Component} from 'react';
import withHotkey from 'react-hotkey-hoc';
import EditorHelpModal from 'universal/components/EditorHelpModal/EditorHelpModal';

@withHotkey
class EditorHelpModalContainer extends Component {
  static propTypes = {
    bindHotkey: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  componentWillMount() {
    const {bindHotkey} = this.props;
    bindHotkey('?', this.toggleModal);
    bindHotkey('escape', this.closeModal);
  }

  toggleModal = () => {
    this.setState({isOpen: !this.state.isOpen});
  }

  closeModal = () => {
    this.setState({isOpen: false});
  }

  render() {
    return (
      <EditorHelpModal
        handleCloseModal={this.closeModal}
        isOpen={this.state.isOpen}
      />
    );
  }
}

export default EditorHelpModalContainer;

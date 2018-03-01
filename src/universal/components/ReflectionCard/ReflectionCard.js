/**
 * Renders a fully visible retrospective reflection card.
 *
 * @flow
 */
import React, {Component} from 'react';
import styled from 'react-emotion';
import FontAwesome from 'react-fontawesome';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import ReflectionCardWrapper from 'universal/components/ReflectionCardWrapper/ReflectionCardWrapper';

type Props = {
  contents: string,
  handleDelete?: () => any
};

type State = {
  showDelete: boolean
};

const DeleteButton = styled(PlainButton)({
  backgroundColor: 'rgba(0, 0, 0, 0)',
  color: 'red',
  position: 'absolute',
  top: '-0.5rem',
  right: '-0.5rem',
  zIndex: 1
});

const ReflectionCardText = styled('div')({
  maxHeight: '10rem',
  overflow: 'auto',
  padding: '0.8rem'
});

export default class ReflectionCard extends Component<Props, State> {
  state = {
    showDelete: false
  };

  componentDidMount() {
    if (this.deleteButton) {
      this.deleteButton.addEventListener('focus', this.showDelete);
    }
    if (this.deleteButton) { // flow makes us check this twice...
      this.deleteButton.addEventListener('blur', this.hideDelete);
    }
  }

  componentWillUnmount() {
    if (this.deleteButton) {
      this.deleteButton.removeEventListener('focus', this.showDelete);
    }
    if (this.deleteButton) { // flow makes us check this twice...
      this.deleteButton.removeEventListener('blur', this.hideDelete);
    }
  }

  showDelete = () => {
    this.setState({showDelete: true});
  };

  hideDelete = () => {
    this.setState({showDelete: false});
  };

  saveDeleteButton = (deleteButton: ?HTMLElement) => {
    this.deleteButton = deleteButton;
  };

  deleteButton: ?HTMLElement;

  render() {
    const {contents, handleDelete} = this.props;
    const {showDelete} = this.state;
    const placeholder = 'My reflection thought...';
    return (
      <ReflectionCardWrapper onMouseEnter={handleDelete && this.showDelete} onMouseLeave={handleDelete && this.hideDelete}>
        {handleDelete &&
          <DeleteButton innerRef={this.saveDeleteButton} aria-label="Delete this reflection" onClick={handleDelete}>
            {showDelete && <FontAwesome name="times-circle" />}
          </DeleteButton>
        }
        <ReflectionCardText>{contents || placeholder}</ReflectionCardText>
      </ReflectionCardWrapper>
    );
  }
}

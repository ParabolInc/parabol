/**
 * Stories for the RetroCard component.
 *
 * @flow
 */

import React, {Component} from 'react';
import styled from 'react-emotion';
import FontAwesome from 'react-fontawesome';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import PlainButton from 'universal/components/PlainButton/PlainButton';
import appTheme from 'universal/styles/theme/appTheme';

import StoryContainer from './components/StoryContainer';

type Props = {
  contents: string,
  handleDelete: () => any
};

type State = {
  showDelete: boolean
};

const RetroBackground = styled('div')({
  backgroundColor: '#F1F0FA',
  padding: '1rem',
  height: '100%',
  width: '100%'
});

const RetroCardWrapper = styled('div')({
  backgroundColor: '#FFF',
  borderRadius: 3,
  boxShadow: '0 0 1px 1px rgba(0, 0, 0, .1)',
  color: appTheme.palette.dark,
  minHeight: '1rem',
  padding: '0.8rem',
  position: 'relative',
  width: '20rem'
});

const RetroCardText = styled('div')({
  maxHeight: '10rem',
  overflow: 'auto'
});

const DeleteButton = styled(PlainButton)({
  backgroundColor: 'rgba(0, 0, 0, 0)',
  color: 'red',
  position: 'absolute',
  top: '-0.5rem',
  right: '-0.5rem',
  zIndex: 1
});

class RetroCard extends Component<Props, State> {
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
      <RetroCardWrapper onMouseEnter={this.showDelete} onMouseLeave={this.hideDelete}>
        <DeleteButton innerRef={this.saveDeleteButton} aria-label="Delete this reflection" onClick={handleDelete}>
          {showDelete && <FontAwesome name="times-circle" />}
        </DeleteButton>
        <RetroCardText>{contents || placeholder}</RetroCardText>
      </RetroCardWrapper>
    );
  }
}

// STORIES

storiesOf('RetroCard', module)
  .add('with no contents', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <RetroCard
            contents=""
            handleDelete={action('clicked-delete')}
          />
        </RetroBackground>
      )}
    />
  ))
  .add('with one line', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <RetroCard
            contents="One line of text."
            handleDelete={action('clicked-delete')}
          />
        </RetroBackground>
      )}
    />
  ))
  .add('with many lines', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <RetroCard
            contents={
              'This is a long observation. ' +
              'I have a lot of feelings and want my team to know. ' +
              "There's much to say, and I hope people have the patience to read this because it's, like, super important. " +
              'At some point, this will get really long, and it should probably overflow by scrolling. ' +
              "I hope folks don't get mad at me for writing so much. " +
              'Seriously. When will I stop??'
            }
            handleDelete={action('clicked-delete')}
          />
        </RetroBackground>
      )}
    />
  ));

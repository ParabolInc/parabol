/**
 * Shows an "anonymous" reflection card; e.g. a card created by another teammate
 * which has not yet become visible.
 *
 * @flow
 */
// $FlowFixMe
import {ContentState, EditorState} from 'draft-js';
import React, {Component} from 'react';
import styled from 'react-emotion';

import EditorInputWrapper from 'universal/components/EditorInputWrapper';
import ReflectionCardWrapper from 'universal/components/ReflectionCardWrapper/ReflectionCardWrapper';

type Props = {
  contentState: ContentState,
  isEditing?: boolean
};

type State = {
  obfuscatedContentState: ContentState
};

const randomChar = () => String.fromCharCode(97 + Math.floor(Math.random() * 26));

// Given a string, returns another string which has the same "shape", e.g.
// same punctuation and word length, but with completely random characters.
const obfuscate = (content: string): string => (
  content
    .split('')
    .map((char) =>
      /^[a-z0-9]+$/i.test(char) ? randomChar() : char
    )
    .join('')
);

const obfuscateContentState = (contentState: ContentState): ContentState => (
  ContentState.createFromText(obfuscate(contentState.getPlainText()))
);

const BlurredDiv = styled('div')({
  filter: 'blur(4px)',
  userSelect: 'none'
});

const ReflectionContents = styled('div')({
  padding: '0.8rem'
});

class AnonymousReflectionCard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      obfuscatedContentState: obfuscateContentState(props.contentState)
    };
  }

  componentWillReceiveProps({contentState: nextContentState}: Props) {
    const {contentState: thisContentState} = this.props;
    if (!thisContentState.getBlockMap().equals(nextContentState.getBlockMap())) {
      this.setState({
        obfuscatedContentState: obfuscateContentState(nextContentState)
      });
    }
  }

  render() {
    const {isEditing} = this.props;
    const {obfuscatedContentState} = this.state;
    return (
      <ReflectionCardWrapper>
        <ReflectionContents>
          {isEditing || !obfuscatedContentState.hasText() ? (
            'Somebody is typing...'
          ) : (
            <BlurredDiv>
              <EditorInputWrapper
                editorState={EditorState.createWithContent(obfuscatedContentState)}
                readOnly
              />
            </BlurredDiv>
          )
          }
        </ReflectionContents>
      </ReflectionCardWrapper>
    );
  }
}

export default AnonymousReflectionCard;

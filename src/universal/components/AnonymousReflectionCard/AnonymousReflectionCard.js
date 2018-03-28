/**
 * Shows an "anonymous" reflection card; e.g. a card created by another teammate
 * which has not yet become visible.
 *
 * @flow
 */
// $FlowFixMe
import {EditorState} from 'draft-js';
import React, {Component} from 'react';
import styled from 'react-emotion';

import EditorInputWrapper from 'universal/components/EditorInputWrapper';
import ReflectionCardWrapper from 'universal/components/ReflectionCardWrapper/ReflectionCardWrapper';
import {createFragmentContainer} from 'react-relay';

import type {AnonymouseReflectionCard_reflection as Reflection} from './__generated/AnonymouseReflectionCard_reflection.graphql';

type Props = {
  reflection: Reflection
};

type State = {
  editorState: EditorState
};

const defaultText = 'Somebody is typing...'
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

const MaybeBlurredDiv = styled('div')(({blur}) => ({
  filter: blur && 'blur(4px)',
  userSelect: 'none'
}));

const ReflectionContents = styled('div')({
  padding: '0.8rem'
});

class AnonymousReflectionCard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = this.getNextState(props.reflection);
  }

  componentWillReceiveProps(nextProps: Props) {
    const {reflection: {content: nextContent}} = nextProps;
    if (nextContent !== this.props.reflection.content) {
      this.setState(this.getNextState(nextProps.reflection));
    }
  }

  getContent = (reflection: Reflection) => {
    const {content, isEditing} = reflection;
    if (isEditing) return defaultText;
    const parsedContent = JSON.parse(content);
    const textBlocks = parsedContent.blocks.map(({text}) => text);
    const fullText = textBlocks.join('\n');
    if (fullText.length === 0) return defaultText;
    return obfuscate(fullText);
  };

  getNextState = (reflection) => {
    const contentStr = this.getContent(reflection);
    const editorState = EditorState.createWithContent(contentStr);
    return {
      editorState,
      isBlurred: contentStr === defaultText
    };
  };

  render() {
    const {editorState, isBlurred} = this.state;
    return (
      <ReflectionCardWrapper>
        <ReflectionContents>
          <MaybeBlurredDiv blur={isBlurred}>
            <EditorInputWrapper
              editorState={editorState}
              readOnly
            />
          </MaybeBlurredDiv>
        </ReflectionContents>
      </ReflectionCardWrapper>
    );
  }
}

export default createFragmentContainer(
  AnonymousReflectionCard,
  graphql`
    fragment AnonymousReflectionCard_reflection on RetroReflection {
      isEditing
      content
    }
  `
);

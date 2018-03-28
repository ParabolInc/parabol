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

import type {AnonymousReflectionCard_reflection as Reflection} from './__generated__/AnonymousReflectionCard_reflection.graphql';
import reactLifecyclesCompat from 'react-lifecycles-compat';

type Props = {
  reflection: Reflection
};

type State = {
  editorState: EditorState,
  content: string,
  isBlurred: boolean
};

const defaultText = 'Somebody is typing...';
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
  static getContent(reflection: Reflection) {
    const {content, isEditing} = reflection;
    if (isEditing) return defaultText;
    const parsedContent = JSON.parse(content);
    const textBlocks = parsedContent.blocks.map(({text}) => text);
    const fullText = textBlocks.join('\n');
    if (fullText.length === 0) return defaultText;
    return obfuscate(fullText);
  };

  static getNextState = (reflection) => {
    const contentStr = this.getContent(reflection);
    const editorState = EditorState.createWithContent(contentStr);
    return {
      content: reflection.content,
      editorState,
      isBlurred: contentStr === defaultText
    };
  };

  static getDerivedStateFromProps(nextProps: Props, prevState: State): $Shape<State> | null {
    const {reflection} = nextProps;
    const {content: nextContent} = reflection;
    if (nextContent === prevState.content) return null;
    return AnonymousReflectionCard.getNextState(reflection);
  }

  constructor(props: Props) {
    super(props);
    this.state = this.getNextState(props.reflection);
  }

  render() {
    const {editorState, isBlurred} = this.state;
    return (
      <ReflectionCardWrapper>
        <ReflectionContents>
          <MaybeBlurredDiv blur={isBlurred}>
            <EditorInputWrapper editorState={editorState} readOnly />
          </MaybeBlurredDiv>
        </ReflectionContents>
      </ReflectionCardWrapper>
    );
  }
}

reactLifecyclesCompat(AnonymousReflectionCard);

export default createFragmentContainer(
  AnonymousReflectionCard,
  graphql`
    fragment AnonymousReflectionCard_reflection on RetroReflection {
      isEditing
      content
    }
  `
);

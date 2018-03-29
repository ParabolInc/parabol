/**
 * Shows an "anonymous" reflection card; e.g. a card created by another teammate
 * which has not yet become visible.
 *
 * @flow
 */
// $FlowFixMe
import {ContentState, EditorState} from 'draft-js';
import React, {Component} from 'react';

import ReflectionCardWrapper from 'universal/components/ReflectionCardWrapper/ReflectionCardWrapper';
import {createFragmentContainer} from 'react-relay';

import type {AnonymousReflectionCard_reflection as Reflection} from './__generated__/AnonymousReflectionCard_reflection.graphql';
import type {AnonymousReflectionCard_meeting as Meeting} from './__generated__/AnonymousReflectionCard_meeting.graphql';
import reactLifecyclesCompat from 'react-lifecycles-compat';
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper';

type Props = {
  meeting: Meeting,
  reflection: Reflection,
};

type State = {
  editorState: EditorState,
  content: string,
  isBlurred: boolean
};

const DEFAULT_TEXT = 'Somebody is typing...';
const ROT = Math.floor(Math.random() * 25) + 1;
const obfuscate = (content: string): string => {
  return content.replace(/[a-zA-Z]/g, (c) => {
    // eslint-disable-next-line
    return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + ROT) ? c : c - (ROT * 2));
  });
}

class AnonymousReflectionCard extends Component<Props, State> {
  static getContent(reflection: Reflection) {
    const {content, isEditing} = reflection;
    if (isEditing) return DEFAULT_TEXT;
    const parsedContent = JSON.parse(content);
    const textBlocks = parsedContent.blocks.map(({text}) => text);
    const fullText = textBlocks.join('\n');
    if (fullText.length === 0) return DEFAULT_TEXT;
    return obfuscate(fullText);
  };

  static getNextState = (reflection) => {
    const contentStr = AnonymousReflectionCard.getContent(reflection);
    const editorState = EditorState.createWithContent(ContentState.createFromText(contentStr));
    return {
      content: reflection.content,
      editorState,
      isBlurred: contentStr !== DEFAULT_TEXT
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
    this.state = AnonymousReflectionCard.getNextState(props.reflection);
  }

  render() {
    const {editorState, isBlurred} = this.state;
    const {meeting: {teamId}} = this.props;
    return (
      <ReflectionCardWrapper>
        <ReflectionEditorWrapper editorState={editorState} isBlurred={isBlurred} readOnly teamId={teamId}/>
      </ReflectionCardWrapper>
    );
  }
}

reactLifecyclesCompat(AnonymousReflectionCard);

export default createFragmentContainer(
  AnonymousReflectionCard,
  graphql`
    fragment AnonymousReflectionCard_meeting on RetrospectiveMeeting {
      teamId
    }
    fragment AnonymousReflectionCard_reflection on RetroReflection {
      isEditing
      content
    }
  `
);

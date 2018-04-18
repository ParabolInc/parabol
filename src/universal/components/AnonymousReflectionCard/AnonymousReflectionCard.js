/**
 * Shows an "anonymous" reflection card; e.g. a card created by another teammate
 * which has not yet become visible.
 *
 * @flow
 */
// $FlowFixMe
import {ContentState, EditorState, SelectionState} from 'draft-js';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';

import type {AnonymousReflectionCard_reflection as Reflection} from './__generated__/AnonymousReflectionCard_reflection.graphql';
import type {AnonymousReflectionCard_meeting as Meeting} from './__generated__/AnonymousReflectionCard_meeting.graphql';
import reactLifecyclesCompat from 'react-lifecycles-compat';
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper';
import {makeContentWithEntity} from 'universal/utils/draftjs/completeEnitity';
import anonymousReflectionDecorators from 'universal/components/TaskEditor/anonymousReflectionDecorators';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';

type Props = {
  meeting: Meeting,
  reflection: Reflection,
};

type State = {
  editorState: EditorState,
  content: string,
  isBlurred: boolean,
  isEditing: boolean
};

const AnonymousStyles = styled('div')({
  backgroundColor: ui.palette.white,
  borderRadius: ui.cardBorderRadius,
  boxShadow: ui.cardBoxShadow,
  color: ui.hintFontColor,
  position: 'relative'
});

const DEFAULT_TEXT = 'Somebody is typing...';
const ROT = Math.floor(Math.random() * 25) + 1;
const obfuscate = (content: string): string => {
  return content.replace(/[a-zA-Z]/g, (c: string) => {
    // $FlowFixMe
    return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + ROT) ? c : c - (ROT * 2)); // eslint-disable-line
  });
};

const getContentState = (contentText) => {
  const contentState = ContentState.createFromText(contentText);
  if (contentText !== DEFAULT_TEXT) return contentState;
  const contentStateWithEntity = contentState
    .createEntity('ELLIPSIS', 'IMMUTABLE', {});
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const anchorKey = contentState.getFirstBlock().getKey();
  const selectionState = new SelectionState({
    anchorOffset: DEFAULT_TEXT.length - 3,
    focusOffset: DEFAULT_TEXT.length,
    anchorKey,
    focusKey: anchorKey
  });
  return makeContentWithEntity(contentState, selectionState, undefined, entityKey);
};

class AnonymousReflectionCard extends Component<Props, State> {
  static getContent(reflection: Reflection) {
    const {content, isEditing} = reflection;
    if (isEditing) return DEFAULT_TEXT;
    const parsedContent = JSON.parse(content);
    const textBlocks = parsedContent.blocks.map(({text}) => text);
    const fullText = textBlocks.join('\n');
    if (fullText.length === 0) return DEFAULT_TEXT;
    return obfuscate(fullText);
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State): $Shape<State> | null {
    const {reflection} = nextProps;
    const {content} = reflection;
    const isEditing = Boolean(reflection.isEditing);
    if (content === prevState.content && isEditing === prevState.isEditing) return null;
    const contentText = AnonymousReflectionCard.getContent(reflection);
    const contentState = getContentState(contentText);
    const editorState = EditorState.createWithContent(contentState, anonymousReflectionDecorators);
    return {
      content: reflection.content,
      editorState,
      isBlurred: contentText !== DEFAULT_TEXT,
      isEditing
    };
  }

  state = {
    content: '',
    editorState: null,
    isBlurred: false,
    isEditing: false
  };

  render() {
    const {editorState, isBlurred} = this.state;
    const {meeting: {teamId}} = this.props;
    return (
      <AnonymousStyles>
        <ReflectionEditorWrapper anonEditing={!isBlurred} editorState={editorState} isBlurred={isBlurred} readOnly teamId={teamId} />
      </AnonymousStyles>
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

/**
 * The reflection card presentational component.
 *
 * @flow
 */
// $FlowFixMe
import {ContentState, convertToRaw, EditorState} from 'draft-js';
import React, {Component} from 'react';
import styled, {css} from 'react-emotion';

import EditorInputWrapper from 'universal/components/EditorInputWrapper';
import ReflectionCardWrapper from 'universal/components/ReflectionCardWrapper/ReflectionCardWrapper';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

import ReflectionCardDeleteButton from './ReflectionCardDeleteButton';
import {createFragmentContainer} from 'react-relay';
import UpdateReflectionContentMutation from 'universal/mutations/UpdateReflectionContentMutation';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import RemoveReflectionMutation from 'universal/mutations/RemoveReflectionMutation';
import EditReflectionMutation from 'universal/mutations/EditReflectionMutation';
import type {ReflectionCard_meeting as Meeting} from './__generated__/ReflectionCard_meeting.graphql';
import type {ReflectionCard_reflection as Reflection} from './__generated__/ReflectionCard_reflection.graphql';

export type Props = {|
  canDelete: boolean,
  // The draft-js content for this card
  contentState: ContentState,
  // True when this card is being hovered over by a valid drag source
  hovered?: boolean,
  // True when the current user is the one dragging this card
  iAmDragging?: boolean,
  // Whether we're "collapsed" e.g. in a stack of cards.  This allows us to truncate to a constant height,
  // Simplifying style computations.
  isCollapsed?: boolean,
  // Provided by react-dnd
  isDragging?: boolean,
  // States whether it serves as a drag preview.
  pulled?: boolean,
  // The display name of the phase in which this reflection was created, e.g. "What's working?"
  reflectionPhaseQuestion?: ?string,
  // The name of the user who is currently dragging this card to a new place, if any
  userDragging?: string,
  meeting: Meeting,
  reflection: Reflection,
  ...MutationProps
|};

type State = {
  editorState: EditorState,
};

type DnDStylesWrapperProps = {
  hovered?: boolean,
  pulled?: boolean,
  iAmDragging?: boolean
};

const BottomBar = styled('div')({
  alignItems: 'flex-start',
  color: appTheme.palette.mid,
  display: 'flex',
  fontSize: '0.9rem',
  justifyContent: 'space-between',
  padding: '0.4rem 0.8rem'
});

const DnDStylesWrapper = styled('div')(({pulled, iAmDragging}: DnDStylesWrapperProps) => ({
  opacity: ((iAmDragging && !pulled)) && 0.6
}));

class ReflectionCard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      editorState: EditorState.createWithContent(
        props.contentState,
        editorDecorators(this.getEditorState)
      )
    };
  }

  getEditorState = () => (
    this.state.editorState
  );

  setEditorState = (editorState: EditorState) => {
    this.setState({editorState});
  };

  handleEditorBlur = () => {
    const {atmosphere, reflection: {reflectionId}} = this.props;
    this.handleContentUpdate();
    EditReflectionMutation(atmosphere, {isEditing: false, reflectionId});
  };

  handleEditorFocus = () => {
    const {atmosphere, reflection: {reflectionId}} = this.props;
    EditReflectionMutation(atmosphere, {isEditing: true, reflectionId});
  };

  handleContentUpdate = () => {
    const {atmosphere, meeting: {meetingId}, reflection: {content, reflectionId}, submitMutation, onError, onCompleted} = this.props;
    const {editorState} = this.state;
    const contentState = editorState.getCurrentContent();
    if (contentState.hasText()) {
      const nextContent = JSON.stringify(convertToRaw(contentState));
      if (content === nextContent) return;
      submitMutation();
      UpdateReflectionContentMutation(atmosphere, {reflectionId}, onError, onCompleted);
    } else {
      RemoveReflectionMutation(atmosphere, {reflectionId}, {meetingId}, onError, onCompleted);
    }
  };

  maybeRenderReflectionPhaseQuestion = () => {
    const {isCollapsed, reflectionPhaseQuestion} = this.props;
    return !isCollapsed && reflectionPhaseQuestion && <BottomBar>{reflectionPhaseQuestion}</BottomBar>;
  };

  maybeRenderUserDragging = () => {
    const {isDragging, pulled, userDragging} = this.props;
    const styles = {
      color: appTheme.palette.warm,
      textAlign: 'end'
    };
    return (isDragging && !pulled) && (
      <div className={css(styles)}>
        {userDragging}
      </div>
    );
  };

  renderCardContent = () => {
    const {handleSave, isCollapsed} = this.props;
    const {editorState} = this.state;
    const styles: Object = {
      maxHeight: '10rem',
      overflow: 'auto',
      padding: '0.8rem'
    };
    if (isCollapsed) {
      styles.height = `${ui.retroCardCollapsedHeightRem}rem`;
      styles.overflow = 'hidden';
    }
    return (
      <div className={css(styles)}>
        {handleSave ? (
          <EditorInputWrapper
            ariaLabel="Edit this reflection"
            editorState={editorState}
            handleReturn={() => 'not-handled'}
            onBlur={this.handleEditorBlur}
            onFocus={this.handleEditorFocus}
            placeholder="My reflection thought..."
            setEditorState={this.setEditorState}
          />
        ) : (
          <EditorInputWrapper
            editorState={editorState}
            readOnly
          />
        )}
      </div>
    );
  };

  render() {
    const {canDelete, hovered, iAmDragging, pulled, userDragging, meeting, reflection} = this.props;
    const holdingPlace = Boolean(userDragging && !pulled);
    return (
      <DnDStylesWrapper pulled={pulled} iAmDragging={iAmDragging} hovered={hovered}>
        {this.maybeRenderUserDragging()}
        <ReflectionCardWrapper
          holdingPlace={holdingPlace}
          hoveringOver={hovered}
          pulled={pulled}
        >
          {this.renderCardContent()}
          {this.maybeRenderReflectionPhaseQuestion()}
          {canDelete && <ReflectionCardDeleteButton meeting={meeting} reflection={reflection} />}
        </ReflectionCardWrapper>
      </DnDStylesWrapper>
    );
  }
}

export default createFragmentContainer(
  ReflectionCard,
  graphql`
    fragment ReflectionCard_meeting on RetrospectiveMeeting {
      meetingId: id
      ...ReflectionCardDeleteButton_meeting
    }
    fragment ReflectionCard_reflection on RetroReflection {
      reflectionId: id
      content
      ...ReflectionCardDeleteButton_reflection
    }
  `
)

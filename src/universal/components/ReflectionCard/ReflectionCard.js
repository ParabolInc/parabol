/**
 * The reflection card presentational component.
 *
 * @flow
 */
// $FlowFixMe
import {convertFromRaw, convertToRaw, EditorState} from 'draft-js';
import React, {Component} from 'react';
import styled from 'react-emotion';
import editorDecorators from 'universal/components/TaskEditor/decorators';

import ReflectionCardDeleteButton from './ReflectionCardDeleteButton';
import {createFragmentContainer} from 'react-relay';
import UpdateReflectionContentMutation from 'universal/mutations/UpdateReflectionContentMutation';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import RemoveReflectionMutation from 'universal/mutations/RemoveReflectionMutation';
import EditReflectionMutation from 'universal/mutations/EditReflectionMutation';
import type {ReflectionCard_meeting as Meeting} from './__generated__/ReflectionCard_meeting.graphql';
import type {ReflectionCard_reflection as Reflection} from './__generated__/ReflectionCard_reflection.graphql';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import reactLifecyclesCompat from 'react-lifecycles-compat';
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper';
import {REFLECT} from 'universal/utils/constants';
import isTempId from 'universal/utils/relay/isTempId';
import UserDraggingHeader from 'universal/components/UserDraggingHeader';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import textOverflow from 'universal/styles/helpers/textOverflow';
import findMeetingStage from 'universal/utils/meetings/findMeetingStage';
import StyledError from 'universal/components/StyledError';

export type Props = {|
  // true if the card is in a collapsed group and it is not the top card (default false)
  isCollapsed?: boolean,
  meeting: Meeting,
  reflection: Reflection,
  ...MutationProps
|};

type State = {
  content: string,
  editorState: ?Object,
  getEditorState: () => ?Object
};

const OriginFooter = styled('div')({
  ...textOverflow,
  alignItems: 'flex-start',
  background: '#fff',
  borderRadius: ui.cardBorderRadius,
  color: ui.hintFontColor,
  fontSize: ui.hintFontSize,
  padding: '.5rem .75rem'
});

const ReflectionCardRoot = styled('div')(
  {
    backgroundColor: ui.palette.white,
    border: '.0625rem solid transparent',
    borderRadius: ui.cardBorderRadius,
    boxShadow: ui.cardBoxShadow,
    position: 'relative'
  },
  ({hasDragLock}) => hasDragLock && ({
    borderColor: appTheme.palette.warm50a
  }),
  ({isCollapsed}) => isCollapsed && ({
    height: `${ui.retroCardCollapsedHeightRem}rem`,
    overflow: 'hidden'
  })
);

class ReflectionCard extends Component<Props, State> {
  static getDerivedStateFromProps(nextProps: Props, prevState: State): $Shape<State> | null {
    const {reflection} = nextProps;
    const {content} = reflection;
    if (content === prevState.content) return null;
    const contentState = convertFromRaw(JSON.parse(content));
    // const DEBUG_TEXT = `ReflID: ${reflectionId} | GroupId: ${reflectionGroupId} | Sort: ${sortOrder}`;
    // const contentState = ContentState.createFromText(DEBUG_TEXT);
    return {
      content,
      editorState: EditorState.createWithContent(contentState, editorDecorators(prevState.getEditorState))
    };
  }

  state = {
    content: '',
    editorState: null,
    getEditorState: () => this.state.editorState
  };

  setEditorState = (editorState: EditorState) => {
    this.setState({editorState});
  };

  handleEditorBlur = () => {
    const {atmosphere, reflection: {reflectionId}} = this.props;
    if (isTempId(reflectionId)) return;
    this.handleContentUpdate();
    EditReflectionMutation(atmosphere, {isEditing: false, reflectionId});
  };

  handleEditorFocus = () => {
    const {atmosphere, reflection: {reflectionId}} = this.props;
    if (isTempId(reflectionId)) return;
    EditReflectionMutation(atmosphere, {isEditing: true, reflectionId});
  };

  handleContentUpdate = () => {
    const {atmosphere, meeting: {meetingId}, reflection: {content, reflectionId}, submitMutation, onError, onCompleted} = this.props;
    const {editorState} = this.state;
    if (!editorState) return;
    const contentState = editorState.getCurrentContent();
    if (contentState.hasText()) {
      const nextContent = JSON.stringify(convertToRaw(contentState));
      if (content === nextContent) return;
      submitMutation();
      UpdateReflectionContentMutation(atmosphere, {content: nextContent, reflectionId}, onError, onCompleted);
    } else {
      RemoveReflectionMutation(atmosphere, {reflectionId}, {meetingId}, onError, onCompleted);
    }
  };

  render() {
    const {atmosphere, error, isCollapsed, meeting, reflection, showOriginFooter} = this.props;
    const {editorState} = this.state;
    const {localPhase: {phaseType}, phases, teamId} = meeting;
    const {draggerUser, isViewerCreator, phaseItem: {question}} = reflection;
    const meetingStageRes = findMeetingStage(phases);
    if (!meetingStageRes) return null;
    const {phase: {phaseType: meetingPhaseType}} = meetingStageRes;
    const canDelete = isViewerCreator && phaseType === REFLECT && meetingPhaseType === REFLECT;
    const hasDragLock = draggerUser && draggerUser.id !== atmosphere.viewerId;
    return (
      <ReflectionCardRoot hasDragLock={hasDragLock} isCollapsed={isCollapsed}>
        {hasDragLock && <UserDraggingHeader user={draggerUser} />}
        <ReflectionEditorWrapper
          ariaLabel="Edit this reflection"
          editorState={editorState}
          onBlur={this.handleEditorBlur}
          onFocus={this.handleEditorFocus}
          placeholder="My reflection thought..."
          readOnly={phaseType !== REFLECT}
          setEditorState={this.setEditorState}
          teamId={teamId}
        />
        {error && <StyledError>{error.message}</StyledError>}
        {showOriginFooter && <OriginFooter>{question}</OriginFooter>}
        {canDelete && <ReflectionCardDeleteButton meeting={meeting} reflection={reflection} />}
      </ReflectionCardRoot>
    );
  }
}

reactLifecyclesCompat(ReflectionCard);

export default createFragmentContainer(
  withAtmosphere(withMutationProps(ReflectionCard)),
  graphql`
    fragment ReflectionCard_meeting on RetrospectiveMeeting {
      meetingId: id
      teamId
      localPhase {
        phaseType
      }
      phases {
        phaseType
        stages {
          isComplete
        }
      }
      ...ReflectionCardDeleteButton_meeting
    }
    fragment ReflectionCard_reflection on RetroReflection {
      draggerUser {
        id
        ...UserDraggingHeader_user
      }
      reflectionId: id
      reflectionGroupId
      content
      isViewerCreator
      phaseItem {
        question
      }
      sortOrder
      ...ReflectionCardDeleteButton_reflection
    }
  `
);

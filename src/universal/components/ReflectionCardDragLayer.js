/**
 * The reflection card presentational component.
 *
 * @flow
 */
// $FlowFixMe
import {convertFromRaw, EditorState} from 'draft-js';
import React, {Component} from 'react';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import {createFragmentContainer} from 'react-relay';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import type {ReflectionCard_meeting as Meeting} from './__generated__/ReflectionCard_meeting.graphql';
import type {ReflectionCard_reflection as Reflection} from './__generated__/ReflectionCard_reflection.graphql';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import reactLifecyclesCompat from 'react-lifecycles-compat';
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper';
import {REFLECTION_CARD} from 'universal/utils/constants';
import {ReflectionCardRoot} from 'universal/components/ReflectionCard/ReflectionCard';

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

class ReflectionCardDragLayer extends Component<Props, State> {
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
    editorState: EditorState.createWithContent(contentState, editorDecorators(() => this.state.editorState)
  };

  render() {
    const {editorState} = this.state;
    return (
      <ReflectionCardRoot>
        <ReflectionEditorWrapper
          editorState={editorState}
          readOnly
        />
      </ReflectionCardRoot>
    );
  }
}

reactLifecyclesCompat(ReflectionCardDragLayer);

const source = {
  beginDrag() {
    return {}
  }
};

const collect = (connect, monitor) => ({})
export default createFragmentContainer(
  dragSource(REFLECTION_CARD, source, withAtmosphere(ReflectionCardDragLayer),
    graphql`
    fragment ReflectionCard_meeting on RetrospectiveMeeting {
      meetingId: id
      teamId
      localPhase {
        phaseType
      }
      localStage {
        isComplete
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

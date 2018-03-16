import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import EditorInputWrapper from 'universal/components/EditorInputWrapper';
import PlainButton from 'universal/components/PlainButton/PlainButton';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import 'universal/components/TaskEditor/Draft.css';
import Tooltip from 'universal/components/Tooltip/Tooltip';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import ui from 'universal/styles/ui';
import {tierSupportsUpdateCheckInQuestion} from 'universal/utils/tierSupportsUpdateCheckInQuestion';
import styled from 'react-emotion';
import UpdateNewCheckInQuestionMutation from 'universal/mutations/UpdateNewCheckInQuestionMutation';
import {convertFromRaw, convertToRaw, EditorState} from 'draft-js';

import type {NewCheckInQuestion_team as Team} from './__generated__/NewCheckInQuestion_team.graphql';

const iconStyle = {
  color: ui.colorText,
  display: 'block',
  height: '1.5rem',
  fontSize: '1rem',
  verticalAlign: 'middle',
  marginLeft: '0.5rem',
  paddingTop: '.1875rem',
  textAlign: 'center',
  width: '1.25rem'
};

const buttonStyle = {
  color: ui.colorText,
  display: 'block'
};


const QuestionBlock = styled('div')({
  alignContent: 'center',
  display: 'flex',
  fontSize: '1.5rem',
  lineHeight: '1.25rem',
  padding: `${ui.cardPaddingBase} 0 ${ui.cardPaddingBase} 0`,
  fontWeight: 300
});

const EditorBlock = styled('div')({
  minWidth: '20rem'
});

const getCheckInQuestion = (props) => {
  const {team: {newMeeting}} = props;
  if (!newMeeting) return '';
  const {phases} = newMeeting;
  const checkInPhase = phases.find((phase) => phase.checkInQuestion) || {};
  return checkInPhase.checkInQuestion || '';
};

type Props = {
  atmosphere: Object,
  team: Team
}

type State = {
  editorState: Object
}

class NewCheckInQuestion extends Component<Props, State> {
  constructor(props) {
    super(props);
    const checkInQuestion = getCheckInQuestion(props);
    const contentState = convertFromRaw(JSON.parse(checkInQuestion));
    this.state = {
      editorState: EditorState.createWithContent(contentState, editorDecorators(this.getEditorState))
    };
  }

  componentWillReceiveProps(nextProps) {
    const checkInQuestion = getCheckInQuestion(nextProps);
    const oldCheckInQuestion = getCheckInQuestion(this.props);
    if (checkInQuestion !== oldCheckInQuestion) {
      const contentState = convertFromRaw(JSON.parse(checkInQuestion));
      this.setState({
        editorState: EditorState.createWithContent(contentState, editorDecorators(this.getEditorState))
      });
    }
  }

  getEditorState = () => this.state.editorState;

  setEditorState = (editorState) => {
    const wasFocused = this.state.editorState.getSelection().getHasFocus();
    const isFocused = editorState.getSelection().getHasFocus();
    if (wasFocused && !isFocused) {
      const {atmosphere, team: {newMeeting: {meetingId}}} = this.props;
      const checkInQuestion = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
      UpdateNewCheckInQuestionMutation(atmosphere, {meetingId, checkInQuestion});
    }
    this.setState({
      editorState
    });
  };

  editorRef: any;

  selectAllQuestion = () => {
    this.editorRef.focus();
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const fullSelection = selection.merge({
      anchorKey: contentState.getFirstBlock().getKey(),
      focusKey: contentState.getLastBlock().getKey(),
      anchorOffset: 0,
      focusOffset: contentState.getLastBlock().getLength()
    });
    const nextEditorState = EditorState.forceSelection(editorState, fullSelection);
    this.setEditorState(nextEditorState);
  };

  render() {
    const {atmosphere, team: {newMeeting, tier}} = this.props;
    if (!newMeeting) return null;
    const {facilitatorUserId} = newMeeting;
    const {editorState} = this.state;
    const canEdit = tierSupportsUpdateCheckInQuestion(tier);
    const isEditing = editorState.getSelection().getHasFocus();
    const {viewerId} = atmosphere;
    const isFacilitating = facilitatorUserId === viewerId;
    const buttonIconStyle = {
      ...iconStyle,
      cursor: 'pointer',
      visibility: isEditing ? 'hidden' : 'visible'
    };

    const tip = canEdit
      ? 'Tap to customize the Social Check-in question.'
      : 'Upgrade to a Pro Account to customize the Social Check-in question.';

    return (
      <Tooltip
        tip={<div>{tip}</div>}
        originAnchor={{vertical: 'bottom', horizontal: 'center'}}
        targetAnchor={{vertical: 'top', horizontal: 'center'}}
        hideOnFocus
        maxHeight={40}
        isOpen={(isFacilitating && !isEditing) ? undefined : false}
      >
        <QuestionBlock>
          <EditorBlock>
            <EditorInputWrapper
              editorState={editorState}
              setEditorState={this.setEditorState}
              placehodler="e.g. How are you?"
              readOnly={!canEdit}
              innerRef={(c) => {
                this.editorRef = c;
              }}
            />
          </EditorBlock>
          {isFacilitating &&
          <div>
            {canEdit ?
              <PlainButton aria-label={tip} onClick={this.selectAllQuestion} style={buttonStyle}>
                <FontAwesome name="cog" style={buttonIconStyle} />
              </PlainButton> :
              <FontAwesome name="cog" style={iconStyle} />
            }
          </div>
          }
        </QuestionBlock>
      </Tooltip>
    );
  }
}

export default createFragmentContainer(
  withAtmosphere(NewCheckInQuestion),
  graphql`
    fragment NewCheckInQuestion_team on Team {
      id
      newMeeting {
        meetingId: id
        facilitatorUserId
        phases {
          ... on CheckInPhase {
            checkInQuestion
          }
        }
      }
      tier
    }`
);

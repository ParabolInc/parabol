import {convertFromRaw, convertToRaw, EditorState} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import editorDecorators from 'universal/components/ProjectEditor/decorators';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import MeetingCheckInGreeting from 'universal/modules/meeting/components/MeetingCheckInGreeting';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import UpdateCheckInQuestionMutation from 'universal/mutations/UpdateCheckInQuestionMutation';
import CheckInQuestion from './CheckInQuestion';


class MeetingCheckinPrompt extends Component {
  state = {
    editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(this.props.checkInQuestion)), editorDecorators)
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.checkInQuestion !== this.props.checkInQuestion) {
      this.setState({
        editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(nextProps.checkInQuestion)), editorDecorators)
      });
    }
  }

  setEditorState = (editorState) => {
    const {atmosphere, teamId} = this.props;
    const wasFocused = this.state.editorState.getSelection().getHasFocus();
    const isFocused = editorState.getSelection().getHasFocus();
    if (wasFocused !== isFocused) {
      if (!isFocused) {
        const checkInQuestion = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        UpdateCheckInQuestionMutation(atmosphere, teamId, checkInQuestion);
      }
    }
    this.setState({
      editorState
    });
  }

  render() {
    const {
      avatar,
      canEdit,
      currentName,
      greeting,
      isFacilitating
    } = this.props;
    const {editorState} = this.state;
    const heading = (
      <div>
        <MeetingCheckInGreeting {...{currentName, greeting}} />
        <CheckInQuestion
          editorState={editorState}
          canEdit={canEdit}
          isFacilitating={isFacilitating}
          setEditorState={this.setEditorState}
        />
      </div>
    );
    return (
      <MeetingPrompt
        avatar={avatar}
        avatarLarge
        heading={heading}
      />
    );
  }
}

MeetingCheckinPrompt.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  avatar: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  currentName: PropTypes.string.isRequired,
  checkInQuestion: PropTypes.string.isRequired,
  greeting: PropTypes.shape({
    content: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired
  }),
  isFacilitating: PropTypes.bool,
  onSubmit: PropTypes.func,
  teamId: PropTypes.string
};

export default withAtmosphere(MeetingCheckinPrompt);

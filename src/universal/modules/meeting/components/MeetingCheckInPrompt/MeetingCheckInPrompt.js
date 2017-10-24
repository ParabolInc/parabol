import {css} from 'aphrodite-local-styles/no-important';
import {convertFromRaw, convertToRaw, EditorState} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import editorDecorators from 'universal/components/ProjectEditor/decorators';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';

import appTheme from 'universal/styles/theme/appTheme';
import withStyles from 'universal/styles/withStyles';
import CheckInQuestion from './CheckInQuestion';
import UpdateCheckInQuestionMutation from 'universal/mutations/UpdateCheckInQuestionMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';


const greetingPropType = PropTypes.shape({
  content: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired
});

const greetingStyleThunk = () => ({
  greeting: {
    borderBottom: '1px dashed currentColor',
    color: 'inherit',
    cursor: 'help'
  }
});

let Greeting = ({currentName, greeting, styles}) => (
  <div style={{color: appTheme.palette.warm}}>
    <span
      className={css(styles.greeting)}
      title={`${greeting.content} means “hello” in ${greeting.language}`}
    >
      {greeting.content}
    </span>
    {`, ${currentName}`}
  </div>
);

Greeting.propTypes = {
  currentName: PropTypes.string.isRequired,
  greeting: greetingPropType,
  styles: PropTypes.object.isRequired
};

Greeting = withStyles(greetingStyleThunk)(Greeting);


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
      greeting
    } = this.props;
    const {editorState} = this.state;
    const heading = (
      <div>
        <Greeting {...{currentName, greeting}} />
        <CheckInQuestion editorState={editorState} canEdit={canEdit} setEditorState={this.setEditorState} />
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
  greeting: greetingPropType,
  onSubmit: PropTypes.func,
  teamId: PropTypes.string
};

export default withAtmosphere(MeetingCheckinPrompt);

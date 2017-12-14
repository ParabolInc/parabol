import {css} from 'aphrodite-local-styles/no-important';
import {convertFromRaw, convertToRaw, EditorState} from 'draft-js';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import PlainButton from 'universal/components/PlainButton/PlainButton';
import editorDecorators from 'universal/components/ProjectEditor/decorators';
import 'universal/components/ProjectEditor/Draft.css';
import Tooltip from 'universal/components/Tooltip/Tooltip';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import UpdateCheckInQuestionMutation from 'universal/mutations/UpdateCheckInQuestionMutation';
import ui from 'universal/styles/ui';
import {tierSupportsUpdateCheckInQuestion} from 'universal/utils/tierSupportsUpdateCheckInQuestion';
import withStyles from 'universal/styles/withStyles';
import EditorInputWrapper from 'universal/components/EditorInputWrapper';
import PropTypes from 'prop-types';

class CheckInQuestion extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    styles: PropTypes.object.isRequired,
    team: PropTypes.object.isRequired
  }
  state = {
    editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(this.props.team.checkInQuestion)), editorDecorators)
  };

  componentWillReceiveProps(nextProps) {
    const {team: {checkInQuestion}} = nextProps;
    const {team: {oldCheckInQuestion}} = this.props;
    if (checkInQuestion !== oldCheckInQuestion) {
      this.setState({
        editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(checkInQuestion)), editorDecorators)
      });
    }
  }

  setEditorState = (editorState) => {
    const wasFocused = this.state.editorState.getSelection().getHasFocus();
    const isFocused = editorState.getSelection().getHasFocus();
    if (wasFocused !== isFocused) {
      if (!isFocused) {
        const {atmosphere, team: {id: teamId}} = this.props;
        const checkInQuestion = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        UpdateCheckInQuestionMutation(atmosphere, teamId, checkInQuestion);
      }
    }
    this.setState({
      editorState
    });
  }

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
    const {isFacilitating, styles, team: {tier}} = this.props;
    const {editorState} = this.state;
    const canEdit = tierSupportsUpdateCheckInQuestion(tier);
    const isEditing = editorState.getSelection().getHasFocus();

    const iconStyle = {
      color: ui.palette.dark,
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
      color: ui.palette.dark,
      display: 'block'
    };

    const buttonIconStyle = {
      ...iconStyle,
      cursor: 'pointer',
      visibility: isEditing ? 'hidden' : 'visible'
    };

    const tip = canEdit
      ? 'Tap to customize the Social Check-in question.'
      : 'Upgrade to a Pro Account to customize the Social Check-in question.';

    const tooltipProps = {
      tip: <div>{tip}</div>,
      originAnchor: {vertical: 'bottom', horizontal: 'center'},
      targetAnchor: {vertical: 'top', horizontal: 'center'},
      hideOnFocus: true
    };

    const tooltipHiddenProps = {
      ...tooltipProps,
      isOpen: false
    };

    const whichTooltipProps = (isEditing || !isFacilitating) ? tooltipHiddenProps : tooltipProps;

    return (
      <Tooltip {...whichTooltipProps}>
        <div className={css(styles.root)}>
          <div className={css(styles.editor)}>
            <EditorInputWrapper
              editorState={editorState}
              setEditorState={this.setEditorState}
              placehodler="e.g. How are you?"
              readOnly={!canEdit}
              setRef={(c) => {
                this.editorRef = c;
              }}
            />
          </div>
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
        </div>
      </Tooltip>
    );
  }
}

const styleThunk = () => ({
  root: {
    alignContent: 'center',
    display: 'flex',
    fontSize: '1.5rem',
    lineHeight: '1.25rem',
    padding: `${ui.cardPaddingBase} 0 ${ui.cardPaddingBase} 0`,
    fontWeight: 300
  },

  editor: {
    minWidth: '20rem'
  },

  editorBlockquote: {
    fontStyle: 'italic',
    borderLeft: `.25rem ${appTheme.palette.mid40a} solid`,
    margin: '1rem 0',
    padding: '0 .5rem'
  },

  codeBlock: {
    backgroundColor: appTheme.palette.mid10a,
    color: appTheme.palette.warm,
    fontFamily: appTheme.typography.monospace,
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.s6,
    margin: '0',
    padding: '0 .5rem'
  }
});

export default createFragmentContainer(
  withAtmosphere(withStyles(styleThunk)(CheckInQuestion)),
  graphql`
    fragment CheckInQuestion_team on Team {
      id
      checkInQuestion
      tier
    }`
);

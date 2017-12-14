import {Editor, EditorState} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import editorDecorators from 'universal/components/ProjectEditor/decorators';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import truncateCard from 'universal/utils/draftjs/truncateCard';
import isProjectPrivate from 'universal/utils/isProjectPrivate';
import EmptySpace from '../EmptySpace/EmptySpace';


class Card extends Component {
  constructor(props) {
    super(props);
    this.setEditorState(props.content);
  }

  componentWillReceiveProps(nextProps) {
    const {content: oldContent} = this.props;
    const {content} = nextProps;
    if (content !== oldContent) {
      this.setEditorState(content);
    }
  }

  setEditorState(content) {
    const contentState = truncateCard(content);
    const getEditorState = () => this.state.editorState;
    this.setState({
      editorState: EditorState.createWithContent(contentState, editorDecorators(getEditorState))
    });
  }

  render() {
    const {status, tags} = this.props;
    const {editorState} = this.state;
    const isPrivate = isProjectPrivate(tags);
    const backgroundColor = isPrivate ? ui.privateCardBgColor : '#FFFFFF';

    const cellStyle = {
      padding: 0,
      verticalAlign: 'top'
    };

    const contentStyle = {
      backgroundColor,
      borderColor: ui.cardBorderColor,
      borderRadius: '0 0 4px 4px',
      borderStyle: 'solid',
      borderWidth: '0 1px 1px',
      boxSizing: 'content-box',
      color: appTheme.palette.dark,
      fontFamily: ui.emailFontFamily,
      fontSize: '16px',
      minHeight: '80px',
      lineHeight: '20px',
      padding: '4px 8px',
      textAlign: 'left'
    };

    const borderTopStyle = {
      backgroundColor: labels.projectStatus[status].color,
      borderRadius: '4px 4px 0 0',
      padding: 0
    };

    return (
      <table style={ui.emailTableBase} width="100%">
        <tbody>
          {/* card styled top border */}
          <tr>
            <td style={borderTopStyle}>
              <EmptySpace height={4} />
            </td>
          </tr>
          {/* card body */}
          <tr>
            <td style={cellStyle}>
              <div style={contentStyle}>
                <Editor
                  readOnly
                  editorState={editorState}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

Card.propTypes = {
  content: PropTypes.string,
  status: PropTypes.oneOf(labels.projectStatus.slugs),
  tags: PropTypes.array
};

export default Card;

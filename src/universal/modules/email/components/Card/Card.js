import {Editor, EditorState} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import truncateCard from 'universal/utils/draftjs/truncateCard';
import isTaskPrivate from 'universal/utils/isTaskPrivate';
import EmptySpace from '../EmptySpace/EmptySpace';


class Card extends Component {
  constructor(props) {
    super(props);
    const {content} = props;
    const contentState = truncateCard(content);
    this.state = {
      editorState: EditorState.createWithContent(contentState, editorDecorators(this.getEditorState))
    };
  }

  componentWillReceiveProps(nextProps) {
    const {content: oldContent} = this.props;
    const {content} = nextProps;
    if (content !== oldContent) {
      const contentState = truncateCard(content);
      this.setState({
        editorState: EditorState.createWithContent(contentState, editorDecorators(this.getEditorState))
      });
      this.setEditorState(content);
    }
  }

  getEditorState = () => this.state.editorState;

  render() {
    const {status, tags} = this.props;
    const {editorState} = this.state;
    const isPrivate = isTaskPrivate(tags);
    const backgroundColor = isPrivate ? ui.privateCardBgColor : '#FFFFFF';

    const cellStyle = {
      padding: 0,
      verticalAlign: 'top'
    };

    const contentStyle = {
      backgroundColor,
      borderColor: ui.cardBorderColor,
      borderRadius: '4px',
      borderStyle: 'solid',
      borderWidth: '1px',
      boxSizing: 'content-box',
      color: appTheme.palette.dark,
      fontFamily: ui.emailFontFamily,
      fontSize: '14px',
      minHeight: '88px',
      lineHeight: '20px',
      padding: '4px 12px 12px',
      textAlign: 'left'
    };

    const statusStyle = {
      backgroundColor: labels.taskStatus[status].color,
      borderRadius: '4px',
      height: '4px',
      width: '30px'
    };

    return (
      <table style={ui.emailTableBase} width="100%">
        <tbody>
          <tr>
            <td style={cellStyle}>
              {/* card body */}
              <div style={contentStyle}>
                <EmptySpace height={8} />
                <div style={statusStyle}></div>
                <EmptySpace height={8} />
                <Editor readOnly editorState={editorState} />
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
  status: PropTypes.oneOf(labels.taskStatus.slugs),
  tags: PropTypes.array
};

export default Card;

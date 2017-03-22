import React, {PropTypes} from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import {trimString} from 'universal/utils';
import EmptySpace from '../EmptySpace/EmptySpace';
import ReactMarkdown from 'react-markdown';
import markdownCustomComponents from 'universal/utils/markdownCustomComponents';

const Card = (props) => {
  const {content, status} = props;
  const type = status ? 'project' : 'action';
  let backgroundColor;

  if (type === 'project') {
    backgroundColor = '#FFFFFF';
  } else {
    backgroundColor = ui.actionCardBgColor;
  }

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

  let borderTopStyle;

  if (type === 'project') {
    borderTopStyle = {
      backgroundColor: labels.projectStatus[status].color,
      borderRadius: '4px 4px 0 0',
      padding: 0
    };
  } else {
    borderTopStyle = {
      backgroundColor: labels.action.color,
      borderRadius: '4px 4px 0 0',
      padding: 0
    };
  }

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
              <ReactMarkdown
                renderers={markdownCustomComponents}
                source={trimString(content, 52)}
                escapeHtml
                softBreak="br"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

Card.propTypes = {
  content: PropTypes.string,
  status: PropTypes.oneOf(labels.projectStatus.slugs),
};

export default Card;

import React, {PropTypes} from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import {trimString} from 'universal/utils';
import EmptySpace from '../EmptySpace/EmptySpace';

const Card = (props) => {
  const {content, status, type} = props;

  let backgroundColor;

  if (type === 'project') {
    backgroundColor = '#FFFFFF';
  } else {
    backgroundColor = ui.actionCardBgColor;
  }

  const contentStyle = {
    backgroundColor,
    borderColor: ui.cardBorderColor,
    borderStyle: 'solid',
    borderRadius: '0 0 4px 4px',
    borderWidth: '0 1px 1px',
    color: appTheme.palette.dark,
    fontSize: '16px',
    fontFamily: ui.emailFontFamily,
    height: '62px',
    lineHeight: '20px',
    padding: '4px 8px'
  };

  let borderTopStyle;

  if (type === 'project') {
    borderTopStyle = {
      backgroundColor: labels.projectStatus[status].color,
      borderRadius: '4px 4px 0 0'
    };
  } else {
    borderTopStyle = {
      backgroundColor: labels.action.color,
      borderRadius: '4px 4px 0 0'
    };
  }

  return (
    <table width="100%">
      <tbody>
        {/* card styled top border */}
        <tr>
          <td style={borderTopStyle}>
            <EmptySpace height={4} />
          </td>
        </tr>
        {/* card body */}
        <tr>
          <td align="left" style={contentStyle} vAlign="top">
            {trimString(content, 52)}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

Card.propTypes = {
  content: PropTypes.string,
  status: PropTypes.oneOf(labels.projectStatus.slugs),
  type: PropTypes.oneOf([
    'project',
    'action'
  ])
};

Card.defaultProps = {
  type: 'action'
};

export default Card;

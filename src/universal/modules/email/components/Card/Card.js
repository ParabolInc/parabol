import React, {PropTypes} from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import {trimString} from 'universal/utils';
import EmptySpace from '../EmptySpace/EmptySpace';

const Card = (props) => {
  const {content, status} = props;
  const type = Boolean(status) ? 'project' : 'action';
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
    borderStyle: 'solid',
    borderRadius: '0 0 4px 4px',
    borderWidth: '0 1px 1px',
    textAlign: 'left',

    color: appTheme.palette.dark,
    fontSize: '16px',
    fontFamily: ui.emailFontFamily,
    height: '76px',
    lineHeight: '20px',
    padding: '4px 8px'
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
              {trimString(content, 52)}
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

import PropTypes from 'prop-types';
import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import {trimString} from 'universal/utils';
import EmptySpace from '../EmptySpace/EmptySpace';
import Markdown from '../../../../components/Markdown/Markdown';
import isProjectPrivate from 'universal/utils/isProjectPrivate';

const Card = (props) => {
  const {content, status, tags} = props;
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
              <Markdown source={trimString(content, 52)} />
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
  tags: PropTypes.array
};

export default Card;

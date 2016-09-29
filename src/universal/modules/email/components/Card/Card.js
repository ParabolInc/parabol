import React, {PropTypes} from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import theme from 'universal/styles/theme';
import labels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';

const Card = (props) => {
  const {content, status, type} = props;

  let backgroundColor;

  if (type === 'project') {
    backgroundColor = '#FFFFFF';
  } else {
    backgroundColor = ui.actionCardBgColor;
  }

  const cardBodyStyle = {
    color: theme.palette.dark,
    backgroundColor,
    fontSize: '16px',
    fontFamily: ui.emailFontFamily,
    height: '62px',
    lineHeight: '20px',
    padding: '.5rem .25rem'
  };

  const borderStyle = {
    backgroundColor: ui.cardBorderColor
  };

  const borderLeftStyle = {
    backgroundColor,
    borderLeft: `1px solid ${ui.cardBorderColor}`,
    width: '3px'
  };

  const borderRightStyle = {
    backgroundColor,
    borderRight: `1px solid ${ui.cardBorderColor}`,
    width: '3px'
  };

  const imageStyle = {
    border: 0,
    display: 'block'
  };

  const borderImageBottomLeftAction = '/static/images/email/email-card-action-border-bottom-left@3x.png';
  const borderImageBottomRightAction = '/static/images/email/email-card-action-border-bottom-right@3x.png';

  const borderImageBottomLeftProject = '/static/images/email/email-card-border-bottom-left@3x.png';
  const borderImageBottomRightProject = '/static/images/email/email-card-border-bottom-right@3x.png';

  const borderImageTopLeftAction = '/static/images/email/email-card-action-border-top-left@3x.png';
  const borderImageTopRightAction = '/static/images/email/email-card-action-border-top-right@3x.png';

  const borderImageTopLeftActive = '/static/images/email/email-card-active-border-top-left@3x.png';
  const borderImageTopRightActive = '/static/images/email/email-card-active-border-top-right@3x.png';

  const borderImageTopLeftDone = '/static/images/email/email-card-done-border-top-left@3x.png';
  const borderImageTopRightDone = '/static/images/email/email-card-done-border-top-right@3x.png';

  const borderImageTopLeftFuture = '/static/images/email/email-card-future-border-top-left@3x.png';
  const borderImageTopRightFuture = '/static/images/email/email-card-future-border-top-right@3x.png';

  const borderImageTopLeftStuck = '/static/images/email/email-card-stuck-border-top-left@3x.png';
  const borderImageTopRightStuck = '/static/images/email/email-card-stuck-border-top-right@3x.png';

  let borderImageBottomLeft;
  let borderImageBottomRight;
  let borderImageTopLeft;
  let borderImageTopRight;

  const trimContent = (str, maxLen) => {
    let trimmed = str;
    if (str.length > maxLen) {
      trimmed = `${trimmed.slice(0, maxLen).trim()}...`;
    }
    return trimmed;
  };

  if (type === 'action') {
    borderImageBottomLeft = borderImageBottomLeftAction;
    borderImageBottomRight = borderImageBottomRightAction;
    borderImageTopLeft = borderImageTopLeftAction;
    borderImageTopRight = borderImageTopRightAction;
  } else if (type === 'project') {
    borderImageBottomLeft = borderImageBottomLeftProject;
    borderImageBottomRight = borderImageBottomRightProject;

    if (status === 'active') {
      borderImageTopLeft = borderImageTopLeftActive;
      borderImageTopRight = borderImageTopRightActive;
    } else if (status === 'done') {
      borderImageTopLeft = borderImageTopLeftDone;
      borderImageTopRight = borderImageTopRightDone;
    } else if (status === 'future') {
      borderImageTopLeft = borderImageTopLeftFuture;
      borderImageTopRight = borderImageTopRightFuture;
    } else if (status === 'stuck') {
      borderImageTopLeft = borderImageTopLeftStuck;
      borderImageTopRight = borderImageTopRightStuck;
    }
  }

  let borderTopStyle;

  if (type === 'project') {
    borderTopStyle = {
      backgroundColor: labels.projectStatus[status].color
    };
  } else {
    borderTopStyle = {
      backgroundColor: labels.action.color
    };
  }

  return (
    <table>
      <tbody>
        {/* card styled top border */}
        <tr>
          <td style={borderTopStyle}>
            <img
              style={imageStyle}
              src={`${borderImageTopLeft}`}
              height="4"
              width="4"
            />
          </td>
          <td style={borderTopStyle}><EmptySpace height={4} /></td>
          <td style={borderTopStyle}>
            <img
              style={imageStyle}
              src={`${borderImageTopRight}`}
              height="4"
              width="4"
            />
          </td>
        </tr>
        {/* card body */}
        <tr>
          <td style={borderLeftStyle}></td>
          <td align="left" style={cardBodyStyle} vAlign="top">
            {trimContent(content, 52)}
          </td>
          <td style={borderRightStyle}></td>
        </tr>
        {/* card footer */}
        <tr>
          <td>
            <img
              style={imageStyle}
              src={borderImageBottomLeft}
              height="4"
              width="4"
            />
          </td>
          <td style={borderStyle}>
            <table width="100%">
              <tr>
                <td style={{backgroundColor, borderBottom: `1px solid ${ui.cardBorderColor}`}}><EmptySpace height={3} /></td>
              </tr>
            </table>
          </td>
          <td>
            <img
              style={imageStyle}
              src={borderImageBottomRight}
              height="4"
              width="4"
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

Card.propTypes = {
  content: PropTypes.string,
  status: PropTypes.oneOf([
    'active',
    'done',
    'future',
    'stuck'
  ]),
  type: PropTypes.oneOf([
    'project',
    'action'
  ])
};

Card.defaultProps = {
  type: 'action'
};

export default Card;

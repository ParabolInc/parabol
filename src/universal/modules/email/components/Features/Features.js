import React, {PropTypes} from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import appTheme from 'universal/styles/theme/appTheme';

const Features = (props) => {
  const imageStyle = {
    border: 0,
    display: 'block'
  };

  const copyStyle = {
    color: appTheme.palette.cool,
    fontSize: `${props.fontSize}px`,
    fontWeight: 'bold',
    lineHeight: `${props.lineHeight}`,
    paddingBottom: '16px',
    paddingLeft: '16px',
    paddingTop: '16px',
    textAlign: 'left'
  };

  const tableStyle = {
    borderCollapse: 'collapse',
    marginLeft: 'auto',
    marginRight: 'auto'
  };

  return (
    <div>
      <EmptySpace height={props.vSpacing} />
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td width="64">
              <img
                style={imageStyle}
                src="/static/images/email/email-icon-map@2x.png"
                height="64"
                width="64"
              />
            </td>
            <td style={copyStyle}>
              Build team momentum by <br />creating achievable weekly goals
            </td>
          </tr>
          <tr>
            <td width="64">
              <img
                style={imageStyle}
                src="/static/images/email/email-icon-group-check@2x.png"
                height="64"
                width="64"
              />
            </td>
            <td style={copyStyle}>
              Establish clear ownership <br />and accountability
            </td>
          </tr>
          <tr>
            <td width="64">
              <img
                style={imageStyle}
                src="/static/images/email/email-icon-megaphone@2x.png"
                height="64"
                width="64"
              />
            </td>
            <td style={copyStyle}>
              Automatically share progress <br />inside and outside your team
            </td>
          </tr>
        </tbody>
      </table>
      <EmptySpace height={props.vSpacing} />
    </div>
  );
};

Features.propTypes = {
  fontSize: PropTypes.number,
  lineHeight: PropTypes.number,
  vSpacing: PropTypes.number
};

Features.defaultProps = {
  fontSize: 16,
  lineHeight: 1.5,
  vSpacing: 32
};

export default Features;

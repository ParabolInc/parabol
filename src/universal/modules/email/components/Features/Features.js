import PropTypes from 'prop-types';
import React from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import ui from 'universal/styles/ui';

const Features = (props) => {
  const copyStyle = {
    color: ui.colorText,
    fontSize: `${props.fontSize}px`,
    fontWeight: 'bold',
    lineHeight: `${props.lineHeight}`,
    paddingBottom: '8px',
    paddingTop: '8px',
    textAlign: 'left'
  };

  return (
    <div>
      <EmptySpace height={props.vSpacing} />
      <table style={ui.emailTableBase}>
        <tbody>
          <tr>
            <td style={copyStyle}>
              {'Build team momentum by '}<br />{'creating achievable weekly goals'}
            </td>
          </tr>
          <tr>
            <td style={copyStyle}>
              {'Establish clear ownership '}<br />{'and accountability'}
            </td>
          </tr>
          <tr>
            <td style={copyStyle}>
              {'Automatically share progress '}<br />{'inside and outside your team'}
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

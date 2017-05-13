import PropTypes from 'prop-types';
import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const Button = (props) => {
  const cellStyle = {
    backgroundColor: `${props.backgroundColor}`,
    color: '#FFFFFF',
    fontWeight: 'bold',
    padding: 0,
    textAlign: 'center',
    textTransform: 'uppercase'
  };

  const linkStyle = {
    backgroundColor: `${props.backgroundColor}`,
    color: '#FFFFFF',
    display: 'block',
    fontWeight: 'bold',
    paddingBottom: `${props.vPadding}px`,
    paddingTop: `${props.vPadding}px`,
    textDecoration: 'none',
    textTransform: 'uppercase',
    width: '100%'
  };

  return (
    <table style={ui.emailTableBase} width={`${props.width}px`}>
      <tbody>
        <tr>
          <td align="center" style={cellStyle}>
            <a href={props.url} style={linkStyle}>
              {props.children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

Button.defaultProps = {
  backgroundColor: appTheme.palette.cool,
  vPadding: 12,
  width: 240
};

Button.propTypes = {
  backgroundColor: PropTypes.string,
  children: PropTypes.any,
  vPadding: PropTypes.number,
  url: PropTypes.string,
  width: PropTypes.number
};

export default Button;

import PropTypes from 'prop-types';
import React from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const Callout = (props) => {
  const cellStyle = {
    backgroundColor: '#fff',
    color: appTheme.palette.dark,
    fontFamily: ui.emailFontFamily,
    fontSize: `${props.fontSize}px`,
    fontWeight: props.fontWeight,
    lineHeight: `${props.lineHeight}`,
    padding: `${props.padding}px`,
    textAlign: 'center'
  };

  return (
    <div style={{width: '100%'}}>
      <EmptySpace height={props.vSpacing} />
      <table align="center" style={ui.emailTableBase} width={props.width}>
        <tbody>
          <tr>
            <td align="center" style={cellStyle}>
              {props.children}
            </td>
          </tr>
        </tbody>
      </table>
      <EmptySpace height={props.vSpacing} />
    </div>
  );
};

Callout.propTypes = {
  children: PropTypes.any,
  fontSize: PropTypes.number,
  fontWeight: PropTypes.oneOf([
    400,
    600
  ]),
  lineHeight: PropTypes.number,
  padding: PropTypes.number,
  vSpacing: PropTypes.number,
  width: PropTypes.string
};

Callout.defaultProps = {
  fontSize: 24,
  fontWeight: 600,
  lineHeight: 1.5,
  padding: 32,
  vSpacing: 32,
  width: '80%'
};

export default Callout;

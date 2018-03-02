import PropTypes from 'prop-types';
import React from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const Body = (props) => {
  const {
    align,
    children,
    fontSize,
    lineHeight,
    verticalGutter
  } = props;

  const cellStyle = {
    color: ui.colorText,
    backgroundColor: ui.emailBodyColor,
    fontFamily: ui.emailFontFamily,
    fontSize: `${fontSize}px`,
    lineHeight: `${lineHeight}`,
    padding: 0,
    textAlign: align
  };

  return (
    <table align={align} style={ui.emailTableBase} width="100%">
      <tbody>
        <tr>
          <td align={align} style={cellStyle}>
            <EmptySpace height={verticalGutter} />
            {children}
            <EmptySpace height={verticalGutter} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

Body.propTypes = {
  align: PropTypes.oneOf([
    'center',
    'left'
  ]),
  children: PropTypes.any,
  fontSize: PropTypes.number,
  lineHeight: PropTypes.number,
  verticalGutter: PropTypes.number
};

Body.defaultProps = {
  align: 'center',
  fontSize: 18,
  lineHeight: 1.25,
  verticalGutter: 48
};

export default Body;

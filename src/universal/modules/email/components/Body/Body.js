import React, {PropTypes} from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const Body = (props) => {
  const cellStyle = {
    color: appTheme.palette.dark,
    backgroundColor: ui.emailBackgroundColor,
    fontFamily: ui.emailFontFamily,
    fontSize: `${props.fontSize}px`,
    lineHeight: `${props.lineHeight}`,
    textAlign: 'center'
  };

  return (
    <table width="100%">
      <tbody>
        <tr>
          <td style={cellStyle}>
            <EmptySpace height={props.verticalGutter} />
              {props.children}
            <EmptySpace height={props.verticalGutter} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

Body.propTypes = {
  children: PropTypes.any,
  fontSize: PropTypes.number,
  lineHeight: PropTypes.number,
  verticalGutter: PropTypes.number
};

Body.defaultProps = {
  fontSize: 18,
  lineHeight: 1.25,
  verticalGutter: 48
};

export default Body;

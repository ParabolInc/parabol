import React, {PropTypes} from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';

const Body = (props) => {
  const textStyle = {
    color: theme.palette.dark,
    backgroundColor: ui.emailBackgroundColor,
    fontFamily: ui.emailFontFamily,
    fontSize: `${props.fontSize}px`,
    lineHeight: `${props.lineHeight}`
  };

  return (
    <table width="100%">
      <tbody>
        <tr>
          <td
            align="center"
            style={textStyle}
          >
            <EmptySpace height={48} />
              {props.children}
            <EmptySpace height={48} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

Body.propTypes = {
  children: PropTypes.any,
  fontSize: PropTypes.number,
  lineHeight: PropTypes.number
};

Body.defaultProps = {
  fontSize: 18,
  lineHeight: 1.25
};

export default Body;

import React, {PropTypes} from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import appTheme from 'universal/styles/theme/appTheme';

const Body = (props) => {
  const textStyle = {
    color: appTheme.palette.dark,
    backgroundColor: '#F9FAFB',
    fontFamily: '"Karla", "Helvetica Neue", serif',
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

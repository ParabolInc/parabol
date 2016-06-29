import React, {PropTypes} from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import theme from 'universal/styles/theme';

const Body = (props) => {
  const textStyle = {
    color: theme.palette.dark,
    backgroundColor: '#F9FAFB',
    fontFamily: '"Karla", "Helvetica Neue", serif',
    fontSize: '18px',
    lineHeight: '1.25'
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
  children: PropTypes.any
};

export default Body;

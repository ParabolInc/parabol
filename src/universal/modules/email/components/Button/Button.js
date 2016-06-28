import React, {PropTypes} from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import theme from 'universal/styles/theme';

const Button = (props) => {
  const style = {
    backgroundColor: `${props.backgroundColor}`,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  };

  return (
    <table
      width={`${props.width}px`}
    >
      <tbody>
        <tr>
          <td
            align="center"
            style={style}
          >
            <EmptySpace height={props.paddingVertical} />
            {props.children}
            <EmptySpace height={props.paddingVertical} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

Button.defaultProps = {
  backgroundColor: theme.palette.cool,
  paddingVertical: '12',
  width: '240'
};

Button.propTypes = {
  backgroundColor: PropTypes.string,
  children: PropTypes.any,
  paddingVertical: PropTypes.string,
  width: PropTypes.string
};

export default Button;

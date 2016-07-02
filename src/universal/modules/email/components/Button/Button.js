import React, {PropTypes} from 'react';
import theme from 'universal/styles/theme';

const Button = (props) => {
  const style = {
    backgroundColor: `${props.backgroundColor}`,
    color: '#FFFFFF',
    fontWeight: 'bold',
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
    <table
      width={`${props.width}px`}
    >
      <tbody>
        <tr>
          <td
            align="center"
            style={style}
          >
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
  backgroundColor: theme.palette.cool,
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

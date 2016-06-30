import React, {PropTypes} from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import theme from 'universal/styles/theme';

const ContactUs = (props) => {
  const textStyle = {
    color: theme.palette.dark,
    fontFamily: '"Karla", "Helvetica Neue", serif',
    fontSize: `${props.fontSize}px`,
    lineHeight: `${props.lineHeight}`
  };

  const boldStyle = {
    color: theme.palette.cool,
    fontWeight: 700
  };

  const emailStyle = {
    color: theme.palette.warm,
    fontWeight: 700
  };

  return (
    <table width="100%">
      <tbody>
        <tr>
          <td
            align="center"
            style={textStyle}
          >
            <EmptySpace height={props.vSpacing} />
            <span style={boldStyle}>
              Any feedback or questions?
            </span><br />
            We want to hear from you!<br />
            Email us:&nbsp;
            <a href="mailto:love@parabol.co" style={emailStyle} title="Email us: love@parabol.co">
              love@parabol.co
            </a>
            <EmptySpace height={props.vSpacing} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

ContactUs.propTypes = {
  fontSize: PropTypes.number,
  lineHeight: PropTypes.number,
  vSpacing: PropTypes.number
};

ContactUs.defaultProps = {
  fontSize: 16,
  lineHeight: 1.25,
  vSpacing: 32
};

export default ContactUs;

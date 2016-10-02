import React, {PropTypes} from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import appTheme from 'universal/styles/theme/appTheme';

const ContactUs = (props) => {
  const textStyle = {
    color: appTheme.palette.dark,
    fontFamily: '"Karla", "Helvetica Neue", serif',
    fontSize: `${props.fontSize}px`,
    lineHeight: `${props.lineHeight}`
  };

  const boldStyle = {
    color: appTheme.palette.cool,
    fontWeight: 700
  };

  const emailStyle = {
    color: appTheme.palette.warm,
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

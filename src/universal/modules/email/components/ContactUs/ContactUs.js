import React, {PropTypes} from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const ContactUs = (props) => {
  const cellStyle = {
    color: appTheme.palette.dark,
    fontFamily: ui.emailFontFamily,
    fontSize: `${props.fontSize}px`,
    lineHeight: `${props.lineHeight}`,
    textAlign: 'center'
  };

  const headingStyle = {
    color: appTheme.palette.cool,
    fontSize: `${props.fontSize * 1.5}px`,
    fontWeight: 700
  };

  const linkStyle = {
    color: appTheme.palette.warm,
    fontWeight: 700,
    textDecoration: 'none'
  };

  return (
    <table width="100%">
      <tbody>
        <tr>
          <td style={cellStyle}>
            <EmptySpace height={props.vSpacing} />
            <span style={headingStyle}>
              {props.prompt}
            </span><br />
            {props.tagline}<br />
            Email us:&nbsp;
            <a href="mailto:love@parabol.co" style={linkStyle} title="Email us: love@parabol.co">
              love@parabol.co
            </a>
            {props.hasLearningLink &&
              <span>
                <br />
                <a
                  href="https://focus.parabol.co/how-to-navigate-uncertainty-fc0dfaaf3830"
                  rel="noopener noreferrer"
                  style={linkStyle}
                  target="_blank"
                  title="How to Navigate Uncertainty using the Action Rhythm"
                >
                  Learn More
                </a> about the Action Meeting Process.
              </span>
            }
            <EmptySpace height={props.vSpacing} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

ContactUs.propTypes = {
  fontSize: PropTypes.number,
  hasLearningLink: PropTypes.bool,
  lineHeight: PropTypes.number,
  prompt: PropTypes.string,
  tagline: PropTypes.string,
  vSpacing: PropTypes.number
};

ContactUs.defaultProps = {
  fontSize: 16,
  hasLearningLink: false,
  lineHeight: 1.25,
  prompt: 'Any feedback or questions?',
  tagline: 'We want to hear from you!',
  vSpacing: 32
};

export default ContactUs;

import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';
import Avatar from 'universal/components/Avatar/Avatar';

const MeetingPrompt = (props) => {
  const {
    avatar,
    heading,
    helpText,
    styles,
    subHeading
  } = props;
  return (
    <div className={css(styles.meetingPromptRoot)}>
      <div className={css(styles.avatarBlock)}>
        <Avatar picture={avatar || defaultUserAvatar} size="fill" />
      </div>
      <div className={css(styles.body)}>
        <div className={css(styles.heading)}>
          {heading}
        </div>
        {subHeading &&
          <div className={css(styles.subHeading)}>
            {subHeading}
          </div>
        }
        {helpText &&
          <div className={css(styles.helpText)}>
            {helpText}
          </div>
        }
      </div>
    </div>
  );
};

MeetingPrompt.propTypes = {
  avatar: PropTypes.string,
  avatarLarge: PropTypes.bool,
  heading: PropTypes.any,
  helpText: PropTypes.any,
  styles: PropTypes.object,
  subHeading: PropTypes.any
};

const promptBreakpoint = ui.breakpoint.wider;

const styleThunk = (theme, {avatarLarge}) => ({
  meetingPromptRoot: {
    // backgroundColor: appTheme.palette.mid10l,
    // borderRadius: '.5rem',
    // boxShadow: ui.shadow[2],
    display: 'flex',
    overflow: 'hidden'
  },

  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '4.25rem',
    padding: '.75rem 1rem .75rem 0',

    [promptBreakpoint]: {
      minHeight: '5.25rem',
      padding: '1rem 1.5rem 1rem 0'
    }
  },

  heading: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s5,
    fontWeight: 600,
    lineHeight: '1.5',
    margin: 0,
    padding: 0,
    width: '100%',

    [promptBreakpoint]: {
      fontSize: appTheme.typography.s6
    }
  },

  subHeading: {
    color: appTheme.palette.dark90l,
    fontSize: appTheme.typography.s4,
    fontWeight: 600,
    lineHeight: '1.5',
    margin: 0,
    padding: 0,
    width: '100%',

    [promptBreakpoint]: {
      fontSize: appTheme.typography.s5
    }
  },

  helpText: {
    color: appTheme.palette.dark90l,
    fontSize: appTheme.typography.s2,
    lineHeight: '1.5',
    margin: 0,
    padding: 0,
    width: '100%',

    [promptBreakpoint]: {
      fontSize: appTheme.typography.s3
    }
  },

  avatarBlock: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    padding: '.75rem',
    width: avatarLarge ? '8rem' : '6rem',

    [promptBreakpoint]: {
      padding: '1rem',
      width: avatarLarge ? '10rem' : '8rem'
    }
  }
});

export default withStyles(styleThunk)(MeetingPrompt);

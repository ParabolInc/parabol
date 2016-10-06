import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';

const MeetingPrompt = (props) => {
  const {heading, helpText, styles} = props;
  const iconStyle = {
    display: 'block',
    fontSize: ui.iconSize2x,
    height: ui.iconSize2x,
    lineHeight: ui.iconSize2x,
    textAlign: 'center'
  };
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.iconBlock)}>
        <div className={css(styles.iconGroup)}>
          <FontAwesome className={css(styles.iconTop)} name="commenting-o" style={iconStyle} />
          <FontAwesome className={css(styles.iconBottom)} name="comment" style={iconStyle} />
        </div>
      </div>
      <div className={css(styles.body)}>
        <div className={css(styles.heading)}>
          {heading}
        </div>
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
  heading: PropTypes.any,
  helpText: PropTypes.any,
  styles: PropTypes.object
};

const iconWidth = '2rem';
const iconBlockWidth = '3rem';
const iconBlockWidthLarge = '4rem';

const promptBreakpoint = ui.breakpoint.wider;

const styleThunk = () => ({
  root: {
    display: 'inline-block',
    paddingLeft: iconBlockWidth,
    position: 'relative',

    [promptBreakpoint]: {
      paddingLeft: iconBlockWidthLarge
    }
  },

  body: {
    background: appTheme.palette.mid10l,
    borderRadius: '0 .5rem .5rem 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '4.25rem',
    padding: '.5rem 1rem',

    [promptBreakpoint]: {
      minHeight: '5.25rem',
      padding: '1rem 1.5rem'
    }
  },

  heading: {
    color: appTheme.palette.dark,
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s5,
    fontWeight: 700,
    lineHeight: '1.5',
    margin: 0,
    padding: 0,
    width: '100%',

    [promptBreakpoint]: {
      fontSize: appTheme.typography.s6
    }
  },

  helpText: {
    color: appTheme.palette.dark90l,
    fontSize: appTheme.typography.s3,
    lineHeight: '1.5',
    margin: 0,
    padding: 0,
    width: '100%',

    [promptBreakpoint]: {
      fontSize: appTheme.typography.s4
    }
  },

  iconBlock: {
    background: appTheme.palette.mid30l,
    borderRadius: '.5rem 0 0 .5rem',
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: iconBlockWidth,

    [promptBreakpoint]: {
      width: iconBlockWidthLarge,
    }
  },

  iconGroup: {
    height: ui.iconSize2x,
    left: '50%',
    lineHeight: ui.iconSize2x,
    margin: '-14px auto auto -1rem',
    position: 'absolute',
    top: '50%',
    width: iconWidth
  },

  iconTop: {
    color: appTheme.palette.dark,
    position: 'relative',
    width: iconWidth,
    zIndex: 200
  },

  iconBottom: {
    color: '#fff',
    left: 0,
    position: 'absolute',
    top: 0,
    width: iconWidth,
    zIndex: 100
  }
});

export default withStyles(styleThunk)(MeetingPrompt);

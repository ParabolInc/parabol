import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const Tag = (props) => {
  const {
    colorPalette,
    label,
    styles
  } = props;

  const tagStyles = css(
    styles.tagBase,
    styles[colorPalette]
  );

  return (
    <div className={tagStyles}>
      {label}
    </div>
  );
};

Tag.propTypes = {
  colorPalette: PropTypes.oneOf(ui.tagPalette),
  label: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  tagBase: {
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    borderRadius: '4em',
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontSize: '.625rem',
    fontWeight: 700,
    height: '.875rem',
    lineHeight: '.75rem',
    marginLeft: ui.tagGutter,
    padding: '0 .4375rem',
    textTransform: 'uppercase',
    verticalAlign: 'middle'
  },

  cool: {
    backgroundColor: appTheme.palette.cool10l,
    borderColor: appTheme.palette.cool40l,
    color: appTheme.palette.cool
  },

  gray: {
    backgroundColor: appTheme.palette.mid10l,
    borderColor: appTheme.palette.mid30l,
    color: appTheme.palette.dark
  },

  light: {
    backgroundColor: appTheme.palette.light,
    borderColor: appTheme.palette.light70g,
    color: appTheme.palette.light30d
  },

  warm: {
    backgroundColor: appTheme.palette.warm10l,
    borderColor: appTheme.palette.warm40l,
    color: appTheme.palette.warm
  },

  white: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    color: appTheme.palette.mid
  }
});

export default withStyles(styleThunk)(Tag);

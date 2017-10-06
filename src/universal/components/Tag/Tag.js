import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {tagBase} from './tagBase';

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
  tagBase,

  cool: {
    backgroundColor: appTheme.palette.cool10l,
    color: appTheme.palette.cool
  },

  gray: {
    backgroundColor: appTheme.palette.mid10l,
    color: appTheme.palette.dark
  },

  light: {
    backgroundColor: appTheme.palette.light,
    color: appTheme.palette.light30d
  },

  warm: {
    backgroundColor: appTheme.palette.warm10l,
    color: appTheme.palette.warm
  },

  white: {
    backgroundColor: '#fff',
    color: appTheme.palette.mid
  }
});

export default withStyles(styleThunk)(Tag);

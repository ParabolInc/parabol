import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {tagBase} from './tagBase';

const TagPro = (props) => {
  const {label, styles} = props;
  return (
    <div className={css(styles.tagBase)}>
      <div className={css(styles.tagInner)}>
        {label || 'Pro'}
      </div>
    </div>
  );
};

TagPro.propTypes = {
  label: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  tagBase: {
    ...tagBase,
    backgroundColor: appTheme.palette.light70d,
    minWidth: '3.25rem',
    padding: '.0625rem'
  },

  tagInner: {
    backgroundColor: appTheme.palette.light80d,
    borderRadius: '4em',
    border: '.0625rem solid rgba(255, 255, 255, .5)',
    color: appTheme.palette.light40d,
    height: '.875rem',
    lineHeight: '.75rem',
    padding: ui.tagPadding,
    textShadow: '0 .0625rem 0 rgba(255, 255, 255, .5)'
  }
});

export default withStyles(styleThunk)(TagPro);

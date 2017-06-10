import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const MentionTag = (props) => {
  const {active, description, name, styles} = props;
  const itemStyle = css(
    styles.row,
    active && styles.active
  );
  return (
    <div className={itemStyle}>
      <span className={css(styles.value)}>{name}</span>
      <span className={css(styles.description)}>{description}</span>
    </div>
  );
};

MentionTag.propTypes = {
  active: PropTypes.bool,
  description: PropTypes.string,
  styles: PropTypes.object,
  value: PropTypes.string
};

const styleThunk = () => ({
  active: {
    backgroundColor: ui.menuItemBackgroundColorHover
  },

  description: {
    marginLeft: '.5rem'
  },

  row: {
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
    fontSize: ui.menuItemFontSize,
    height: ui.menuItemHeight,
    lineHeight: ui.menuItemHeight,
    padding: '0 1rem'
  },

  value: {
    fontWeight: 700,
    minWidth: '4.5rem'
  }
});

export default withStyles(styleThunk)(MentionTag);

import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import mentionBaseStyles from '../MentionBase/mentionBaseStyles';

const MentionEmoji = (props) => {
  const {active, emoji, value, styles} = props;
  const itemStyle = css(
    styles.row,
    active && styles.active
  );
  return (
    <div className={itemStyle}>
      <div className={css(styles.value)}>{emoji}</div>
      <div className={css(styles.description)}>{value}</div>
    </div>
  );
};

MentionEmoji.propTypes = {
  active: PropTypes.bool,
  emoji: PropTypes.string,
  styles: PropTypes.object,
  value: PropTypes.string
};

const styleThunk = () => ({
  // includes row, active, description
  ...mentionBaseStyles,

  value: {
    minWidth: '1.5rem'
  }
});

export default withStyles(styleThunk)(MentionEmoji);

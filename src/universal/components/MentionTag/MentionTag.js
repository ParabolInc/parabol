import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import mentionBaseStyles from '../MentionBase/mentionBaseStyles';

const MentionTag = (props) => {
  const {active, description, name, styles} = props;
  const itemStyle = css(
    styles.row,
    active && styles.active
  );
  return (
    <div className={itemStyle}>
      <div className={css(styles.value)}>{name}</div>
      <div className={css(styles.description)}>{description}</div>
    </div>
  );
};

MentionTag.propTypes = {
  active: PropTypes.bool,
  description: PropTypes.string,
  styles: PropTypes.object,
  name: PropTypes.string
};

const styleThunk = () => ({
  // includes row, active, description
  ...mentionBaseStyles,

  value: {
    fontWeight: 600,
    minWidth: '4.5rem'
  }
});

export default withStyles(styleThunk)(MentionTag);

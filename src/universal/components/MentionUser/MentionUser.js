import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import mentionBaseStyles from '../MentionBase/mentionBaseStyles';
import Avatar from 'universal/components/Avatar/Avatar';

const MentionUser = (props) => {
  const {active, preferredName, picture, styles} = props;
  const itemStyle = css(
    styles.row,
    active && styles.active
  );
  return (
    <div className={itemStyle}>
      <Avatar picture={picture} size="smallest" />
      <div className={css(styles.description)}>{preferredName}</div>
    </div>
  );
};

MentionUser.propTypes = {
  active: PropTypes.bool,
  description: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  // includes row, active, description
  ...mentionBaseStyles
});

export default withStyles(styleThunk)(MentionUser);

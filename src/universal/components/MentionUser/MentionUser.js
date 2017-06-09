import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
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
      <span className={css(styles.description)}>{preferredName}</span>
    </div>
  );
};

MentionUser.propTypes = {
  active: PropTypes.bool,
  description: PropTypes.string,
  styles: PropTypes.object,
  value: PropTypes.string
};

const styleThunk = () => ({
  active: {
    backgroundColor: appTheme.palette.dark,
    color: '#fff'
  },

  description: {
    marginLeft: '.5rem'
  },

  row: {
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
    padding: '.5rem'
  },

  value: {
    fontWeight: 700
  }
});

export default withStyles(styleThunk)(MentionUser);

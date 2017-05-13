import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const MentionTag = (props) => {
  const {active, description, value, styles} = props;
  const itemStyle = css(
    styles.row,
    active && styles.active
  );
  return (
    <div className={itemStyle}>
      <span className={css(styles.value)}>{value}</span>
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

export default withStyles(styleThunk)(MentionTag);

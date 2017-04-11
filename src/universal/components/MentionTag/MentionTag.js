import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const MentionItem = (props) => {
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
  )
};

const styleThunk = () => ({
  active: {
    backgroundColor: appTheme.palette.cool,
  },

  description: {
    marginLeft: '8px'
  },

  row: {
    display: 'flex',
    padding: '4px'
  },

  value: {
    fontWeight: 800,
  }
});

export default withStyles(styleThunk)(MentionItem);

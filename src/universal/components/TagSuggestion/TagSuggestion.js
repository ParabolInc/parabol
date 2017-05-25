import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const TagSuggestion = (props) => {
  const {
    mention,
    theme,
    searchValue, // eslint-disable-line no-unused-vars
    styles,
    ...parentProps
  } = props;
  const itemStyle = css(
    styles.row,
    //active && styles.active
  );
  return (
  <div className={itemStyle} {...parentProps}>
    <span className={css(styles.value)}>{ mention.get('name')}</span>
    <span className={css(styles.description)}>{ mention.get('description')}</span>
  </div>
  );
};


TagSuggestion.propTypes = {
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
    padding: '.5rem',
    ':active': {
      backgroundColor: appTheme.palette.dark,
      color: '#fff'
    }
  },

  value: {
    fontWeight: 700
  }
});

export default withStyles(styleThunk)(TagSuggestion);
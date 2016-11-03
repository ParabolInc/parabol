import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const UserTag = (props) => {
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

UserTag.propTypes = {
  colorPalette: PropTypes.oneOf([
    'gray',
    'light',
    'white'
  ]),
  isAdmin: PropTypes.bool,
  isLead: PropTypes.bool,
  label: PropTypes.string,
  styles: PropTypes.object
};

UserTag.defaultProps = {
  email: 'email@domain.co'
};

const styleThunk = () => ({
  tagBase: {
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    borderRadius: '4em',
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontSize: '.625rem',
    fontWeight: 700,
    height: '.875rem',
    lineHeight: '.75rem',
    marginLeft: '.75rem',
    padding: '0 .4375rem',
    textTransform: 'uppercase',
    verticalAlign: 'middle'
  },

  gray: {
    backgroundColor: appTheme.palette.mid10l,
    borderColor: appTheme.palette.mid30l,
    color: appTheme.palette.dark
  },

  light: {
    backgroundColor: appTheme.palette.light,
    borderColor: appTheme.palette.light70g,
    color: appTheme.palette.light30d
  },

  white: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    color: appTheme.palette.mid
  }
});

export default withStyles(styleThunk)(UserTag);

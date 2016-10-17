import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const WelcomeHeader = (props) => {
  const {heading, styles} = props;
  return (
    <div className={css(styles.root)}>
      <h1 className={css(styles.heading)}>{heading}</h1>
    </div>
  );
};
WelcomeHeader.propTypes = {
  heading: PropTypes.object,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    alignContent: 'center',
    backgroundColor: appTheme.palette.mid10l,
    borderBottom: `2px solid ${appTheme.palette.mid50l}`,
    display: 'flex !important',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '20vh',
    padding: '4rem',
    textAlign: 'center'
  },

  heading: {
    color: appTheme.palette.warm,
    fontFamily: appTheme.typography.serif,
    fontSize: '2rem',
    fontWeight: 700,
    margin: 0,
    padding: 0
  }
});

export default withStyles(styleThunk)(WelcomeHeader);

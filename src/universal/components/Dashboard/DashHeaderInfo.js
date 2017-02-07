import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

const DashHeaderInfo = (props) => {
  const {children, styles, title} = props;
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.title)}>
        {title}
      </div>
      {children &&
        <div className={css(styles.children)}>
          {children}
        </div>
      }
    </div>
  );
};


DashHeaderInfo.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object,
  title: PropTypes.any
};

const styleThunk = () => ({
  root: {
    width: '100%'
  },

  title: {
    color: appTheme.palette.dark10d,
    // @terry, had to do this to bump down the children for the error message when it comes
    display: 'inline-block',
    fontSize: appTheme.typography.s5,
    height: appTheme.typography.s6,
    lineHeight: appTheme.typography.s6
  },

  children: {
    color: appTheme.palette.dark70l,
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.sBase,
    marginTop: '.125rem'
  }
});

export default withStyles(styleThunk)(DashHeaderInfo);

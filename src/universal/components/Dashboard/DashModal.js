import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const DashModal = (props) => {
  const {children, styles} = props;
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.modal)}>
        {children}
      </div>
    </div>
  );
};

DashModal.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    alignItems: 'center',
    background: 'rgba(255, 255, 255, .5)',
    bottom: 0,
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    left: ui.dashSidebarWidth,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    top: 0,
    zIndex: 400
  },

  modal: {
    background: '#fff',
    boxShadow: `0 0 0 .25rem ${appTheme.palette.mid30a}`,
    borderRadius: '.5rem',
    padding: '2rem',
    width: '30rem'
  }
});

export default withStyles(styleThunk)(DashModal);

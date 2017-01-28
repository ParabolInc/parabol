import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const DashModal = (props) => {
  const {
    children,
    inputModal,
    isClosing,
    onBackdropClick,
    position,
    showsOver,
    styles
  } = props;
  const backdropStyles = css(
    styles.backdrop,
    position && styles[position],
    showsOver && styles[showsOver]
  );
  const modalStyles = css(
    styles.modal,
    inputModal && styles.inputModal,
    isClosing && styles.closing
  );
  const onClick = (e) => {
    if (e.target === e.currentTarget) {
      onBackdropClick();
    }
  };
  return (
    <div className={backdropStyles} onClick={onClick}>
      <div className={modalStyles}>
        {children}
      </div>
    </div>
  );
};

DashModal.propTypes = {
  children: PropTypes.any,
  onBackdropClick: PropTypes.func,

  // NOTE: Use 'fixed' to show over 'viewport'.
  //       Default styles use 'fixed' and 'viewport' values.
  //       Use 'absolute' to show over 'main'.

  position: PropTypes.oneOf([
    'absolute',
    'fixed'
  ]),
  showsOver: PropTypes.oneOf([
    'main',
    'viewport'
  ]),
  styles: PropTypes.object
};

const animateIn = {
  '0%': {
    opacity: '0',
    transform: 'translate3d(0, -50px, 0)'

  },
  '100%': {
    opacity: '1',
    transform: 'translate3d(0, 0, 0)'
  }
};

const animateOut = {
  '0%': {
    opacity: '1',
    transform: 'translate3d(0, 0, 0)'

  },
  '100%': {
    opacity: '0',
    transform: 'translate3d(0, -50px, 0)'
  }
};

const styleThunk = () => ({
  backdrop: {
    alignItems: 'center',
    background: 'rgba(255, 255, 255, .5)',
    bottom: 0,
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    left: 0,
    position: 'fixed',
    right: 0,
    textAlign: 'center',
    top: 0,
    zIndex: 400
  },

  closing: {
    animationDuration: '100ms',
    animationName: animateOut
  },

  viewport: {
    left: 0
  },

  main: {
    left: ui.dashSidebarWidth
  },

  absolute: {
    position: 'absolute'
  },

  fixed: {
    position: 'fixed'
  },

  inputModal: {
    background: ui.dashBackgroundColor,
    padding: '1rem',
    width: '20rem'
  },

  modal: {
    background: '#fff',
    border: `.125rem solid ${appTheme.palette.mid30a}`,
    // boxShadow: `0 0 0 .25rem ${appTheme.palette.mid30a}, ${ui.modalBoxShadow}`,
    boxShadow: ui.modalBoxShadow,
    borderRadius: ui.modalBorderRadius,
    padding: '2rem',
    width: '30rem',
    animationName: animateIn,
    animationDuration: '200ms'
  },

});

export default withStyles(styleThunk)(DashModal);

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
    modalLayout,
    styles
  } = props;
  const backdropStyles = css(
    styles.backdrop,
    position && styles[position],
    modalLayout && styles[modalLayout]
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
    <div className={backdropStyles} onClick={onBackdropClick ? onClick : null}>
      <div className={modalStyles}>
        {children}
      </div>
    </div>
  );
};

DashModal.propTypes = {
  children: PropTypes.any,
  closeAfter: PropTypes.number,
  inputModal: PropTypes.bool,
  isClosing: PropTypes.bool,
  onBackdropClick: PropTypes.func,

  // NOTE: Use 'fixed' to show over 'viewport'.
  //       Default styles use 'fixed' and 'viewport' values.
  //       Use 'absolute' to show over 'main' or 'mainHasDashAlert'.
  //       SEE: ui.modalLayout for options

  position: PropTypes.oneOf([
    'absolute',
    'fixed'
  ]),
  modalLayout: PropTypes.oneOf(ui.modalLayout),
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

const styleThunk = (theme, props) => ({
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
    animationDuration: `${props.closeAfter}ms`,
    animationName: animateOut
  },

  [ui.modalLayoutMain]: {
    left: ui.dashSidebarWidth
  },

  [ui.modalLayoutMainWithDashAlert]: {
    left: ui.dashSidebarWidth,
    top: ui.dashAlertHeight
  },

  [ui.modalLayoutViewport]: {
    left: 0
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
    boxShadow: ui.modalBoxShadow,
    borderRadius: ui.modalBorderRadius,
    padding: '1.25rem',
    width: '30rem',
    animationIterationCount: 1,
    animationName: animateIn,
    animationDuration: '200ms'
  }
});

export default withStyles(styleThunk)(DashModal);

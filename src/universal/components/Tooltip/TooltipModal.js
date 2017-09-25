import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import portal from 'react-portal-hoc';
import AnimatedFade from 'universal/components/AnimatedFade';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {TransitionGroup} from 'react-transition-group';

const TooltipModal = (props) => {
  const {
    isClosing,
    tip,
    coords,
    setModalRef,
    styles
  } = props;

  const menuStyles = css(styles.modalBlock, isClosing && styles.closing);
  return (
    <div className={menuStyles} style={coords} ref={setModalRef}>
      <div className={css(styles.contents)}>
        <TransitionGroup appear style={{overflow: 'hidden'}}>
          <AnimatedFade appear>
            {tip}
          </AnimatedFade>
        </TransitionGroup>
      </div>
    </div>
  );
};


TooltipModal.propTypes = {
  coords: PropTypes.shape({
    left: PropTypes.number,
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number
  }),
  isClosing: PropTypes.bool,
  setModalRef: PropTypes.func.isRequired,
  styles: PropTypes.object,
  tip: PropTypes.any.isRequired
};

const animateOut = {
  '0%': {
    opacity: '1',
    transform: 'translate3d(0, 0, 0)'

  },
  '100%': {
    opacity: '0',
    transform: 'translate3d(0, -32px, 0)'
  }
};

const styleThunk = (theme, {maxHeight, maxWidth}) => ({
  closing: {
    animationDuration: '150ms',
    animationName: animateOut
  },

  modalBlock: {
    maxWidth,
    padding: '.25rem .5rem',
    position: 'absolute',
    zIndex: ui.ziMenu
  },

  contents: {
    padding: '.5rem',
    color: 'white',
    backgroundColor: 'black',
    borderRadius: ui.menuBorderRadius,
    boxShadow: ui.menuBoxShadow,
    maxHeight,
    outline: 0,
    opacity: 0.7,
    overflow: 'hidden',
    paddingBottom: ui.menuGutterVertical,
    paddingTop: ui.menuGutterVertical,
    textAlign: 'left',
    width: '100%',
    whiteSpace: 'nowrap'
  }
});

export default portal({closeAfter: 100})(
  withStyles(styleThunk)(TooltipModal)
);

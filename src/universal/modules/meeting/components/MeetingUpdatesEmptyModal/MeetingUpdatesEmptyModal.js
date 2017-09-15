import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import portal from 'react-portal-hoc';

const MeetingUpdatesEmptyModal = (props) => {
  const {
    advanceButton,
    currentTeamMemberName,
    isClosing,
    styles
  } = props;
  const modalStyles = css(
    styles.modal,
    isClosing && styles.closing
  );
  return (
    <div className={modalStyles}>
      <div className={css(styles.heading)}>
        {'No projects; any updates?'}
      </div>
      <p>{'We’re not currently tracking any projects for'} <b>{currentTeamMemberName}</b>{'.'}</p>
      <p>{'You can add projects during the Agenda.'}</p>
      <p>{'Just press “'}<b>{'+'}</b>{'” to add an Agenda Item.'}</p>
      {advanceButton &&
        <div className={css(styles.buttonBlock)}>
          {advanceButton()}
        </div>
      }
    </div>
  );
};

MeetingUpdatesEmptyModal.propTypes = {
  advanceButton: PropTypes.func,
  currentTeamMemberName: PropTypes.string,
  closeAfter: PropTypes.number,
  isClosing: PropTypes.bool,
  styles: PropTypes.object
};

// TODO: move common modal animations to ui.js

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

const styleThunk = (theme, {closeAfter}) => ({
  backdrop: {
    bottom: 0,
    left: 0,
    position: 'fixed',
    right: 0,
    top: 0
  },

  modal: {
    animationDuration: '200ms',
    animationIterationCount: 1,
    animationName: animateIn,
    backgroundColor: appTheme.palette.light50l,
    borderRadius: ui.modalBorderRadius,
    boxShadow: ui.modalBoxShadow,
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s4,
    left: `calc((100% - ${ui.meetingSidebarWidth}) / 2)`,
    lineHeight: '1.5',
    marginLeft: '-3rem', // (36rem / 2) - ui.meetingSidebarWidth ?
    maxWidth: '36rem',
    padding: '1.5rem',
    position: 'absolute',
    textAlign: 'center',
    top: '15rem',
    width: '100%',
    zIndex: ui.zi7
  },

  closing: {
    animationDuration: `${closeAfter}ms`,
    animationName: animateOut
  },

  heading: {
    fontSize: appTheme.typography.s6,
    fontWeight: 700,
    lineHeight: '2',
    margin: '0 0 1rem'
  },

  buttonBlock: {
    marginTop: '1rem'
  }
});

export default portal({escToClose: false, closeAfter: 100})(
  withStyles(styleThunk)(MeetingUpdatesEmptyModal)
);

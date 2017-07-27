import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import portal from 'react-portal-hoc';
import boundedModal from 'universal/decorators/boundedModal/boundedModal';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Spinner from 'universal/modules/spinner/components/Spinner/Spinner';

const AsyncMenu = (props) => {
  const {
    closePortal,
    left,
    loading,
    top,
    Mod,
    setLoading,
    setMenuRef,
    styles,
    queryVars
  } = props;

  const menuBlockStyle = {
    left,
    top
  };
  return (
    <div className={css(styles.menuBlock)} style={menuBlockStyle} ref={setMenuRef}>
      <div className={css(styles.menu)}>
        {Mod && <Mod closePortal={closePortal} setLoading={setLoading} {...queryVars} />}
        <ReactCSSTransitionGroup
          transitionName={{
            appear: css(styles.spinnerAppear),
            appearActive: css(styles.spinnerAppearActive)
          }}
          transitionAppear
          transitionEnter={false}
          transitionLeave={false}
          transitionAppearTimeout={300}
        >
          {
            loading &&
            <div key="spinner" className={css(styles.spinner)}>
              <Spinner fillColor="cool" width={40}/>
            </div>
          }
        </ReactCSSTransitionGroup>
      </div>
    </div>
  );
};

AsyncMenu.defaultProps = {
  menuOrientation: 'left',
  verticalAlign: 'middle'
};

AsyncMenu.propTypes = {
};

const styleThunk = (theme, {maxHeight, maxWidth}) => ({
  menuBlock: {
    maxWidth,
    paddingTop: '.25rem',
    position: 'absolute',
    zIndex: ui.ziMenu
  },

  menu: {
    backgroundColor: ui.menuBackgroundColor,
    borderRadius: ui.menuBorderRadius,
    boxShadow: ui.menuBoxShadow,
    maxHeight,
    outline: 0,
    overflowY: 'auto',
    paddingBottom: ui.menuGutterVertical,
    paddingTop: ui.menuGutterVertical,
    textAlign: 'left',
    width: '100%'
  },

  label: {
    ...textOverflow,
    borderBottom: `1px solid ${appTheme.palette.mid30l}`,
    color: ui.palette.dark,
    fontSize: ui.menuItemFontSize,
    fontWeight: 700,
    lineHeight: ui.menuItemHeight,
    marginBottom: ui.menuGutterVertical,
    padding: `0 ${ui.menuGutterHorizontal}`
  },

  spinner: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '3rem',
    minWidth: maxWidth,
    width: '100%'
  },

  spinnerAppear: {
    opacity: 0,
    transform: 'translate3d(0, 10px, 0)'
  },

  spinnerAppearActive: {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
    transition: 'all 300ms ease-in'
  }
});

export default portal({escToClose: true, clickToClose: true})(
  boundedModal(
    withStyles(styleThunk)(AsyncMenu)
  )
);

import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import portal from 'react-portal-hoc';
import boundedModal from 'universal/decorators/boundedModal/boundedModal';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';

const AsyncMenu = (props) => {
  const {
    closePortal,
    left,
    top,
    maxWidth,
    maxHeight,
    Mod,
    setCoords,
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
        <TransitionGroup appear style={{overflow: 'hidden'}}>
          {Mod ?
            <AnimatedFade key="1">
              <Mod
                {...queryVars}
                maxHeight={maxHeight}
                maxWidth={maxWidth}
                closePortal={closePortal}
                setCoords={setCoords}
              />
            </AnimatedFade> :
            <AnimatedFade key="2" exit={false} >
              <LoadingComponent height={'5rem'} width={maxWidth}/>
            </AnimatedFade>
          }
        </TransitionGroup>
      </div>
    </div>
  );
};

AsyncMenu.defaultProps = {
  menuOrientation: 'left',
  verticalAlign: 'middle'
};

AsyncMenu.propTypes = {
  closePortal: PropTypes.func.isRequired,
  left: PropTypes.number,
  top: PropTypes.number,
  Mod: PropTypes.any,
  setCoords: PropTypes.func.isRequired,
  setMenuRef: PropTypes.func.isRequired,
  styles: PropTypes.object,
  queryVars: PropTypes.object
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
  }
});

export default portal({escToClose: true, clickToClose: true})(
  boundedModal(
    withStyles(styleThunk)(AsyncMenu)
  )
);

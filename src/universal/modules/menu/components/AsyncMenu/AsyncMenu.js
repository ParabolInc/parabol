import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import portal from 'react-portal-hoc';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

class AsyncMenu extends Component {
  componentWillMount() {
    this.toggleOpen();
  }

  componentWillUnmount() {
    this.toggleOpen();
  }

  toggleOpen() {
    const {toggleMenuState} = this.props;
    if (toggleMenuState) {
      toggleMenuState();
    }
  }

  render() {
    const {
      closePortal,
      coords,
      maxWidth,
      maxHeight,
      Mod,
      setCoords,
      setMenuRef,
      styles,
      queryVars
    } = this.props;

    return (
      <div className={css(styles.menuBlock)} style={coords} ref={setMenuRef}>
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
              <AnimatedFade key="2" exit={false}>
                <LoadingComponent height={'5rem'} width={maxWidth} />
              </AnimatedFade>
            }
          </TransitionGroup>
        </div>
      </div>
    );
  }
}


AsyncMenu.propTypes = {
  closePortal: PropTypes.func.isRequired,
  coords: PropTypes.shape({
    left: PropTypes.number,
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number
  }),
  maxWidth: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
  Mod: PropTypes.any,
  queryVars: PropTypes.object,
  setCoords: PropTypes.func.isRequired,
  setMenuRef: PropTypes.func.isRequired,
  styles: PropTypes.object,
  toggleMenuState: PropTypes.func
};

const styleThunk = (theme, {maxHeight, maxWidth}) => ({
  menuBlock: {
    maxWidth,
    padding: '.25rem 0',
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
  withStyles(styleThunk)(AsyncMenu)
);

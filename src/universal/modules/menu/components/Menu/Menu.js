import PropTypes from 'prop-types';
import React, { Children, cloneElement, Component } from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import portal from 'react-portal-hoc';
import Spinner from '../../../spinner/components/Spinner/Spinner';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Menu extends Component {
  static defaultProps = {
    menuOrientation: 'left',
    verticalAlign: 'middle'
  };

  static propTypes = {
    children: PropTypes.any,
    closePortal: PropTypes.func,
    coords: PropTypes.object,
    focusOnMount: PropTypes.bool,
    isLoaded: PropTypes.bool,
    itemFactory: PropTypes.func,
    label: PropTypes.string,
    menuOrientation: PropTypes.oneOf([
      'left',
      'right'
    ]),
    maxHeight: PropTypes.string,
    menuWidth: PropTypes.string,
    styles: PropTypes.object,
    toggle: PropTypes.any,
    verticalAlign: PropTypes.oneOf([
      'middle',
      'top'
    ]),
    zIndex: PropTypes.string
  };

  componentDidMount() {
    if (this.props.focusOnMount && this.menuEl) {
      this.menuEl.focus();
    }
  }

  render() {
    const {
      children,
      closePortal,
      coords,
      isLoaded,
      itemFactory,
      label,
      menuWidth,
      styles
    } = this.props;
    const menuBlockStyle = {
      width: menuWidth,
      ...coords
    };
    const kids = Children.map(itemFactory && itemFactory() || children, (child) => cloneElement(child, {closePortal}));
    return (
      <div className={css(styles.menuBlock)} style={menuBlockStyle}>
        <div role="menu" className={css(styles.menu)} tabIndex="-1" ref={(menuEl) => { this.menuEl = menuEl; }}>
          {label && <div className={css(styles.label)}>{label}</div>}
          {kids}
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
              kids.length === 0 && !isLoaded &&
              <div key="spinner" className={css(styles.spinner)}>
                <Spinner fillColor="cool" width={40} />
              </div>
            }
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }
}

const styleThunk = (theme, {maxHeight}) => ({
  menuBlock: {
    paddingTop: '.25rem',
    position: 'absolute',
    zIndex: ui.ziMenu
  },

  menu: {
    backgroundColor: ui.menuBackgroundColor,
    borderRadius: ui.menuBorderRadius,
    boxShadow: ui.menuBoxShadow,
    maxHeight: maxHeight || '10rem',
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

export default portal({escToClose: true, clickToClose: true})(withStyles(styleThunk)(Menu));

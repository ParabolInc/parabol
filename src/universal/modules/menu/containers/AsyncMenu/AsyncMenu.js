import PropTypes from 'prop-types';
import React, {Component} from 'react';
import AsyncMenu from 'universal/modules/menu/components/AsyncMenu/AsyncMenu';

const getOffset = (orientation, fullWidth) => {
  if (orientation === 'center') {
    return fullWidth / 2;
  } else if (orientation === 'right' || orientation === 'bottom') {
    return fullWidth;
  }
  return 0;
};

export default class AsyncMenuContainer extends Component {
  static propTypes = {
    originAnchor: PropTypes.object,
    targetAnchor: PropTypes.object,
    toggle: PropTypes.object,
    maxWidth: PropTypes.number,
    maxHeight: PropTypes.number,
    minWidth: PropTypes.number,
    toggleMargin: PropTypes.number,
    fetchMenu: PropTypes.func.isRequired
  };

  state = {
    loading: false
  };

  componentWillMount() {
    this._mounted = true;
    const {toggle} = this.props;
    this.smartToggle = this.makeSmartToggle(toggle);
  }

  componentWillReceiveProps(nextProps) {
    const {toggle} = nextProps;
    if (this.props.toggle !== toggle) {
      this.smartToggle = this.makeSmartToggle(toggle);
    }
  }

  componentWillUnmount() {
    this._mounted = false;
    window.removeEventListener('resize', this.resizeWindow, {passive: true});
  }

  setMenuRef = (c) => {
    if (c) {
      this.menuRef = c;
      this.setCoords();
    }
  };

  setCoords = () => {
    setTimeout(() => {
      if (!this.menuRef || !this._mounted) return;
      // Bounding adjustments mimic native (flip from below to above for Y, but adjust pixel-by-pixel for X)
      const {originAnchor, targetAnchor, toggleMargin = 0, maxWidth, maxHeight} = this.props;
      const menuCoords = this.menuRef.getBoundingClientRect();
      const menuWidth = menuCoords.width || maxWidth;
      const menuHeight = menuCoords.height || maxHeight;
      const nextCoords = {
        left: undefined,
        top: undefined,
        right: undefined,
        bottom: undefined
      };

      const originLeftOffset = getOffset(originAnchor.horizontal, this.toggleCoords.width);
      const {scrollX, scrollY, innerWidth, innerHeight} = window;
      if (targetAnchor.horizontal !== 'right') {
        const targetLeftOffset = getOffset(targetAnchor.horizontal, menuWidth);
        const left = scrollX + this.toggleCoords.left + originLeftOffset - targetLeftOffset;
        const maxLeft = innerWidth - menuWidth + scrollX;
        nextCoords.left = Math.min(left, maxLeft);
      } else {
        const right = innerWidth - (this.toggleCoords.left + originLeftOffset);
        const maxRight = innerWidth - menuWidth - scrollX;
        nextCoords.right = Math.min(right, maxRight);
      }

      if (targetAnchor.vertical !== 'bottom') {
        const originTopOffset = getOffset(originAnchor.vertical, this.toggleCoords.height);
        const targetTopOffset = getOffset(targetAnchor.vertical, menuHeight);
        const top = scrollY + this.toggleCoords.top + originTopOffset - targetTopOffset + toggleMargin;
        const isBelow = top + menuHeight < innerHeight + scrollY;
        if (isBelow) {
          nextCoords.top = top;
        }
      }
      // if by choice or circumstance, put it above & anchor it from the bottom
      if (nextCoords.top === undefined) {
        const bottom = innerHeight - this.toggleCoords.top - toggleMargin - scrollY;
        const maxBottom = innerHeight - menuHeight + scrollY;
        nextCoords.bottom = Math.min(bottom, maxBottom);
      }

      // listen to window resize only if it's anchored on the right or bottom
      if (nextCoords.left === undefined || nextCoords.top === undefined) {
        window.addEventListener('resize', this.resizeWindow, {passive: true});
      }
      this.setState(nextCoords);
    });
  }

  resizeWindow = () => {
    const {left, top} = this.state;
    if (left === undefined || top === undefined) {
      const menuCoords = this.menuRef.getBoundingClientRect();
      const nextCoords = {
        left: menuCoords.left,
        top: menuCoords.top,
        right: undefined,
        bottom: undefined
      };
      this.setState(nextCoords);
    }
  };

  ensureMod = async () => {
    const {fetchMenu} = this.props;
    const {Mod} = this.state;
    if (!Mod) {
      this.setState({
        loading: true
      });
      const res = await fetchMenu();
      if (this._mounted) {
        this.setState({
          Mod: res.default,
          loading: false
        });
      }
    }
  };

  makeSmartToggle() {
    const {toggle} = this.props;
    return React.cloneElement(toggle, {
      onClick: (e) => {
        // the toggle shouldn't move, so it's safe to save it as a constant
        this.toggleCoords = e.currentTarget.getBoundingClientRect();
        this.setCoords();

        // if they hit the button without first hovering over it, make sure to download the Mod
        const {Mod, loading} = this.state;
        if (!Mod && !loading) {
          this.ensureMod();
        }

        // if the menu was gonna do something, do it
        const {onClick} = toggle.props;
        if (onClick) {
          onClick(e);
        }
      },
      onMouseEnter: this.ensureMod
    });
  }

  render() {
    const {Mod, loading, ...coords} = this.state;
    return (
      <AsyncMenu
        {...this.props}
        setCoords={this.setCoords}
        setMenuRef={this.setMenuRef}
        menuRef={this.menuRef}
        toggle={this.smartToggle}
        coords={coords}
        Mod={Mod}
      />
    );
  }
}

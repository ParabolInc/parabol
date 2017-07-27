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
    const {toggle} = this.props;
    this.smartToggle = this.makeSmartToggle(toggle);
  }

  setLoading = (val) => {
    if (this.state.loading !== val) {
      this.setState({
        loading: val
      });
      this.setCoords();
    }
  };

  setMenuRef = (c) => {
    if (c) {
      this.menuRef = c;
      this.setCoords();
    }
  };

  setCoords() {
    setTimeout(() => {
      if (this.menuRef) {
        const {maxWidth, maxHeight} = this.props;
        const menuCoords = this.menuRef.getBoundingClientRect();
        const width = menuCoords.width || maxWidth;
        const height = menuCoords.height || maxHeight;
        const {originAnchor, targetAnchor, toggleMargin = 0} = this.props;
        const originLeftOffset = getOffset(originAnchor.horizontal, this.toggleCoords.width);
        const targetLeftOffset = getOffset(targetAnchor.horizontal, width);
        const left = window.scrollX + this.toggleCoords.left + originLeftOffset - targetLeftOffset;
        const originTopOffset = getOffset(originAnchor.vertical, this.toggleCoords.height);
        const targetTopOffset = getOffset(targetAnchor.vertical, height);
        const top = window.scrollY + this.toggleCoords.top + originTopOffset - targetTopOffset + toggleMargin;
        console.log('setting left', left, menuCoords.width, width)
        this.setState({
          left,
          top
        });
      }
    })
  }

  ensureMod = async () => {
    const {fetchMenu} = this.props;
    const {Mod} = this.state;
    if (!Mod) {
      this.setState({
        loading: true
      });
      const res = await fetchMenu();
      this.setState({
        Mod: res.default,
        loading: false
      });
    }
  };

  makeSmartToggle = () => {
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
  };

  render() {
    const {left, loading, top, Mod} = this.state;
    return (
      <AsyncMenu
        {...this.props}
        loading={loading}
        setLoading={this.setLoading}
        setMenuRef={this.setMenuRef}
        menuRef={this.menuRef}
        toggle={this.smartToggle}
        left={left}
        top={top}
        Mod={Mod}
      />
    );
  }
}

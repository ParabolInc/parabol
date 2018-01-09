import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Menu from 'universal/modules/menu/components/Menu/Menu';

const calculateMenuPosY = (originHeight, originTop, orientation, targetOrientation) => {
  let topOffset = originTop + window.scrollY;
  if (orientation === 'center') {
    topOffset += originHeight / 2;
  } else if (orientation === 'bottom') {
    topOffset += originHeight;
  }
  return targetOrientation === 'bottom' ? document.body.clientHeight - topOffset : topOffset;
};

const calculateMenuPosX = (originWidth, originLeft, orientation, targetOrientation) => {
  let leftOffset = originLeft + window.scrollX;
  if (orientation === 'center') {
    leftOffset += originWidth / 2;
  } else if (orientation === 'right') {
    leftOffset += originWidth;
  }
  return targetOrientation === 'right' ? document.body.clientWidth - leftOffset : leftOffset;
};

export default class MenuContainer extends Component {
  static propTypes = {
    isLoaded: PropTypes.bool,
    originAnchor: PropTypes.object,
    targetAnchor: PropTypes.object,
    toggle: PropTypes.object
  };

  constructor() {
    super();
    this.state = {};
  }

  render() {
    const {originAnchor, targetAnchor, toggle} = this.props;
    const smartToggle = React.cloneElement(toggle, {
      'aria-haspopup': true,
      onClick: (e) => {
        // always set coords, otherwise we'd have to intercept all calls to closePortal to keep coords at null & window resize events
        // figure out where to put the menu
        const rect = e.currentTarget.getBoundingClientRect();
        const {vertical: originY, horizontal: originX} = originAnchor;
        const {height, width, left, top} = rect;
        this.setState({
          coords: {
            [targetAnchor.vertical]: calculateMenuPosY(height, top, originY, targetAnchor.vertical),
            [targetAnchor.horizontal]: calculateMenuPosX(width, left, originX, targetAnchor.horizontal)
          }
        });
        const {onClick} = toggle.props;
        if (onClick) {
          // if the menu was gonna do something, do it
          onClick(e);
        }
      }
    });
    return (
      <Menu
        {...this.props}
        focusOnMount
        coords={this.state.coords}
        toggle={smartToggle}
      />
    );
  }
}

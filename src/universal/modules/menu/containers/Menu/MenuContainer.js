import {findDOMNode} from 'react-dom';
import React, {Children, Component, PropTypes, cloneElement} from 'react';
import Menu from 'universal/modules/menu/components/Menu/Menu';
import Portal from 'react-portal';

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
  constructor() {
    super();
    this.state = {
      isOpen: false
    };
  }

  setPosition = (coords) => {
    this.setState({
      coords
    })
  };

  closePortal = () => {
    this.setState({
      isOpen: false
    });
  };

  render() {
    const {children, originAnchor, targetAnchor, toggle} = this.props;
    const {coords, isOpen} = this.state;

    const smartToggle = React.cloneElement(toggle, {
      onClick: (e) => {
        // figure out where to put the menu
        const rect = e.target.getBoundingClientRect();
        const {vertical: originY, horizontal: originX} = originAnchor;
        const {height, width, left, top} = rect;
        this.setState({
          isOpen: true,
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
      <div>
        {smartToggle}
        <Portal closeOnEsc closeOnOutsideClick isOpened={isOpen} onClose={this.closePortal}>
          <Menu
            {...this.props}
            children={Children.map(children, (child) => cloneElement(child, {closePortal: this.closePortal}))}
            coords={coords}
            closePortal={this.closePortal}
          />
        </Portal>
      </div>
    );
  }
}

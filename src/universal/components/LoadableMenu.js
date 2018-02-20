import React, {Component} from 'react';
import Modal from 'universal/components/Modal';
import ui from 'universal/styles/ui';
import AnimatedFade from 'universal/components/AnimatedFade';
import {TransitionGroup} from 'react-transition-group';
import PropTypes from 'prop-types';
import withCoordsV2 from 'universal/decorators/withCoordsV2';
import isKeyboardEvent from 'universal/utils/isKeyboardEvent';
import styled from 'react-emotion';

/*
 * Replaces the react-portal-hoc with React16s built-in portal
 * Accept a react-loadable to ensure separation of concerns
 * */


// Aphrodite loads styles async, which make for erroneous height/width calculations.
const MenuBlock = styled('div')(({maxWidth}) => ({
  maxWidth,
  padding: '.25rem 0',
  position: 'absolute',
  zIndex: ui.ziMenu
}));

const MenuContents = styled('div')(({maxHeight}) => ({
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
}));

class LoadableMenu extends Component {
  static propTypes = {
    toggle: PropTypes.any,
    LoadableComponent: PropTypes.func.isRequired,
    setOriginCoords: PropTypes.func.isRequired,
    setModalRef: PropTypes.func.isRequired,
    coords: PropTypes.object.isRequired,
    queryVars: PropTypes.object,
    maxWidth: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    maxHeight: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ])
  };
  state = {
    isOpen: false
  };

  componentWillMount() {
    const {toggle, LoadableComponent} = this.props;
    if (toggle) {
      this.smartToggle = this.makeSmartToggle(toggle);
    } else {
      LoadableComponent.preload();
      this.state.isOpen = true;
    }
  }

  componentWillReceiveProps(nextProps) {
    const {toggle} = nextProps;
    if (this.props.toggle !== toggle) {
      this.smartToggle = this.makeSmartToggle(toggle);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const {isOpen} = nextState;
    const {onOpen, onClose} = nextProps;
    if (isOpen !== this.state.isOpen) {
      if (isOpen && onOpen) {
        // onOpen();
      } else if (!isOpen && onClose) {
        // onClose();
      }
    }
  }

  closePortal = (e) => {
    this.setState({
      isOpen: false
    });
    if (isKeyboardEvent(e) && this.toggleRef) {
      this.toggleRef.focus();
    }
  };

  makeSmartToggle(toggle) {
    // strings are plain DOM nodes
    const refProp = typeof toggle.type === 'string' ? 'ref' : 'innerRef';
    return React.cloneElement(toggle, {
      'aria-haspopup': 'true',
      'aria-expanded': this.state.isOpen,
      onClick: (e) => {
        const {setOriginCoords, LoadableComponent} = this.props;
        LoadableComponent.preload();
        setOriginCoords(e.currentTarget.getBoundingClientRect());
        this.setState({isOpen: !this.state.isOpen});
        // if the menu was gonna do something, do it
        const {onClick} = toggle.props;
        if (onClick) {
          onClick(e);
        }
      },
      onMouseEnter: () => {
        const {LoadableComponent} = this.props;
        LoadableComponent.preload();
      },
      [refProp]: (c) => {
        this.toggleRef = c;
      }
    });
  }

  render() {
    const {isOpen} = this.state;
    const {coords, setModalRef, LoadableComponent, queryVars} = this.props;
    return (
      <React.Fragment>
        {this.smartToggle}
        <TransitionGroup appear component={null}>
          {isOpen &&
          <AnimatedFade>
            <Modal clickToClose escToClose onClose={this.closePortal}>
              <MenuBlock style={coords} innerRef={setModalRef}>
                <MenuContents>
                  <LoadableComponent {...queryVars} closePortal={this.closePortal} />
                </MenuContents>
              </MenuBlock>
            </Modal>
          </AnimatedFade>
          }
        </TransitionGroup>
      </React.Fragment>
    );
  }
}

export default withCoordsV2(LoadableMenu);

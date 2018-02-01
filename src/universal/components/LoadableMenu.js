import React, {Component} from 'react';
import Modal from 'universal/components/Modal';
import ui from 'universal/styles/ui';
import AnimatedFade from 'universal/components/AnimatedFade';
import {TransitionGroup} from 'react-transition-group';
import PropTypes from 'prop-types';
import withCoordsV2 from 'universal/decorators/withCoordsV2';

/*
 * Replaces the react-portal-hoc with React16s built-in portal
 * Accept a react-loadable to ensure separation of concerns
 * */


// Aphrodite loads styles async, which make for erroneous height/width calculations.
const menuBlock = {
  padding: '.25rem 0',
  position: 'absolute',
  zIndex: ui.ziMenu
};

const menu = {
  backgroundColor: ui.menuBackgroundColor,
  borderRadius: ui.menuBorderRadius,
  boxShadow: ui.menuBoxShadow,
  outline: 0,
  overflowY: 'auto',
  paddingBottom: ui.menuGutterVertical,
  paddingTop: ui.menuGutterVertical,
  textAlign: 'left',
  width: '100%'
};

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

  closePortal = () => {
    this.setState({
      isOpen: false
    });
  };

  makeSmartToggle(toggle) {
    return React.cloneElement(toggle, {
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
      }
    });
  }

  render() {
    const {isOpen} = this.state;
    const {coords, setModalRef, LoadableComponent, queryVars, maxWidth, maxHeight} = this.props;
    return (
      <React.Fragment>
        {this.smartToggle}
        <TransitionGroup appear component={null}>
          {isOpen &&
          <AnimatedFade>
            <Modal clickToClose escToClose onClose={this.closePortal}>
              <div style={{...menuBlock, ...coords, maxWidth}} ref={setModalRef}>
                <div style={{...menu, maxHeight}}>
                  <LoadableComponent {...queryVars} closePortal={this.closePortal} />
                </div>
              </div>
            </Modal>
          </AnimatedFade>
          }
        </TransitionGroup>
      </React.Fragment>
    );
  }
}

export default withCoordsV2(LoadableMenu);

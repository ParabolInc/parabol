import React, {Component} from 'react';
import Modal from 'universal/components/Modal';
import PropTypes from 'prop-types';
import isKeyboardEvent from 'universal/utils/isKeyboardEvent';
import withCoordsV2 from 'universal/decorators/withCoordsV2';
import getDisplayName from 'universal/utils/getDisplayName';

/*
 * Takes the child component and puts it in a modal.
 * Provides an isClosing prop to children for animations
 * */

const withLoadablePortal = (options = {}) => (ComposedComponent) => {
  class LoadablePortal extends Component {
    static displayName = `WithLoadablePortal(${getDisplayName(ComposedComponent)})`;
    static propTypes = {
      toggle: PropTypes.any,
      LoadableComponent: PropTypes.func.isRequired,
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
      isOpen: false,
      isClosing: false
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

    openPortal = () => {
      this.setState({
        isOpen: true,
        isClosing: false
      })
    };

    closePortal = (e) => {
      this.setState({
        isClosing: true
      });
      // avoid using this with animations in children because the animation setTimeout will get set before this one does, which means
      // it can cause a flicker. Better to just call terminatePortal in the child or set closeAfter to trigger a little before (hacky)
      if (options.closeAfter) {
        setTimeout(() => {
          this.terminatePortal();
        }, options.closeAfter);
      }

      if (isKeyboardEvent(e) && this.toggleRef) {
        this.toggleRef.focus();
      }
    };

    terminatePortal = () => {
      if (this.state.isClosing || this.state.isOpen) {
        this.setState({
          isClosing: false,
          isOpen: false
        });
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
          if (setOriginCoords) {
            setOriginCoords(e.currentTarget.getBoundingClientRect());
          }
          if (this.state.isOpen) {
            this.closePortal();
          } else {
            this.openPortal()
          }
          // if the modal was gonna do something, do it
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
      const {isClosing, isOpen} = this.state;
      return (
        <React.Fragment>
          {this.smartToggle}
          <Modal clickToClose escToClose onClose={this.closePortal} isOpen={isOpen}>
            <ComposedComponent isClosing={isClosing} closePortal={this.closePortal} terminatePortal={this.terminatePortal} {...this.props} />
          </Modal>
        </React.Fragment>
      );
    }
  }

  return options.withCoords ? withCoordsV2(LoadablePortal) : LoadablePortal;
};

export default withLoadablePortal;

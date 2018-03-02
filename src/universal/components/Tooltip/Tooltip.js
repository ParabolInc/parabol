import PropTypes from 'prop-types';
import React, {Children, cloneElement, Component} from 'react';
import {MAX_INT} from 'universal/utils/constants';
import AnimatedFade from 'universal/components/AnimatedFade';
import Modal from 'universal/components/Modal';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import styled from 'react-emotion';
import withCoordsV2 from 'universal/decorators/withCoordsV2';

const ModalBlock = styled('div')(({maxWidth}) => ({
  padding: '.25rem .5rem',
  position: 'absolute',
  zIndex: ui.ziTooltip,
  maxWidth
}));

const ModalContents = styled('div')(({maxHeight}) => ({
  color: 'white',
  backgroundColor: appTheme.palette.dark,
  borderRadius: ui.tooltipBorderRadius,
  boxShadow: ui.tooltipBoxShadow,
  fontSize: appTheme.typography.s2,
  fontWeight: 700,
  lineHeight: appTheme.typography.s5,
  maxHeight,
  overflow: 'hidden',
  padding: '.375rem .625rem',
  textAlign: 'left',
  textShadow: '0 .0625rem 0 rgba(0, 0, 0, .25)',
  whiteSpace: 'nowrap',
  width: '100%'
}));


class Tooltip extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    children: PropTypes.any.isRequired,
    coords: PropTypes.object.isRequired,
    delay: PropTypes.number,
    hideOnFocus: PropTypes.bool,
    maxHeight: PropTypes.number,
    maxWidth: PropTypes.number,
    tip: PropTypes.any.isRequired,
    setModalRef: PropTypes.func.isRequired,
    setOriginCoords: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.delayOpen = null;
  }

  state = {
    inTip: false,
    inToggle: false,
    isClosing: false,
    canClose: false
  };

  componentDidMount() {
    this.props.setOriginCoords(this.childRef.getBoundingClientRect());
  }

  componentWillReceiveProps(nextProps) {
    const {isOpen, setOriginCoords} = nextProps;
    if (this.props.isOpen !== isOpen) {
      if (isOpen) {
        setOriginCoords(this.childRef.getBoundingClientRect());
      } else {
        this.setState({
          isClosing: true
        });
      }
    }
  }

  makeSmartChildren() {
    const {delay, setOriginCoords, children, hideOnFocus} = this.props;
    const child = Children.only(children);
    /**
     * A "controlled" tooltip is a tooltip which appears and disappears when you
     * ask it to.  It is controlled via the required `isOpen` boolean prop.  It's
     * useful for providing feedback in response to particular events rather than
     * hover/focus state.
     */
    if (typeof this.props.isOpen === 'boolean') return child;
    return cloneElement(child, {
      onMouseEnter: (e) => {
        const clientRect = e.target.getBoundingClientRect();
        const handleMouseEnter = () => {
          setOriginCoords(clientRect);
          this.setState({
            inToggle: true,
            isClosing: false,
            canClose: false
          });
        };
        const {onMouseEnter} = child.props;
        if (onMouseEnter) {
          onMouseEnter(e);
        }
        if (delay > 0 && delay <= MAX_INT) {
          this.delayOpen = setTimeout(handleMouseEnter, delay);
        } else {
          handleMouseEnter();
        }
      },
      onMouseLeave: (e) => {
        // wait tick to see if the cursor goes in the tip
        setTimeout(() => {
          this.setState({
            inToggle: false,
            isClosing: this.state.canClose && !this.state.inTip
          });
        });
        const {onMouseLeave} = child.props;
        if (onMouseLeave) {
          onMouseLeave(e);
        }
        clearTimeout(this.delayOpen);
        this.delayOpen = undefined;
      },
      onFocus: (e) => {
        const {onFocus} = child.props;
        if (onFocus) {
          onFocus(e);
        }
        const {canClose, inToggle, inTip} = this.state;
        if (hideOnFocus) {
          this.setState({
            inToggle: false,
            inTip: false,
            isClosing: canClose && (inToggle || inTip)
          });
          clearTimeout(this.delayOpen);
          this.delayOpen = undefined;
        }
      }
    });
  }

  // this is useful if the tooltip is positioned over the toggle due to small screens, etc.
  makeSmartTip() {
    const {tip} = this.props;
    const {isClosing} = this.state;
    return cloneElement(tip, {
      onMouseEnter: () => {
        // ignore the event if the movement was too slow (eliminates jitter)
        if (!isClosing) {
          this.setState({
            inTip: true
          });
        }
      },
      onMouseLeave: () => {
        if (this.props.isOpen) return;
        setTimeout(() => {
          const {canClose, inTip, inToggle} = this.state;
          if (inTip) {
            this.setState({
              inTip: false,
              isClosing: canClose && !inToggle
            });
          }
        });
      }
    });
  }

  terminatePortal = () => {
    this.setState({
      inTip: false,
      inToggle: false,
      isClosing: false,
      canClose: false
    });
  };

  makeCloseable = () => {
    this.setState({
      canClose: true
    });
  };

  render() {
    const {coords, setModalRef} = this.props;
    const {inTip, inToggle, isClosing} = this.state;
    const isOpen = inTip || inToggle || isClosing || this.props.isOpen;

    return (
      <React.Fragment>
        <div ref={(c) => { this.childRef = c; }}>
          {this.makeSmartChildren()}
        </div>
        <Modal isOpen={isOpen}>
          <AnimatedFade
            appear
            duration={100}
            slide={8}
            in={!isClosing}
            onEntered={this.makeCloseable}
            onExited={this.terminatePortal}
          >
            <ModalBlock style={coords} innerRef={setModalRef}>
              <ModalContents>
                {this.makeSmartTip()}
              </ModalContents>
            </ModalBlock>
          </AnimatedFade>
        </Modal>
      </React.Fragment>
    );
  }
}

export default withCoordsV2(Tooltip);

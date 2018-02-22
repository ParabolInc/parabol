import PropTypes from 'prop-types';
import React, {Children, cloneElement, Component} from 'react';
import {MAX_INT} from 'universal/utils/constants';
import {TransitionGroup} from 'react-transition-group';
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
    this.delayTimer = null;
  }

  state = {
    inTip: false,
    inToggle: false
  };

  componentDidMount() {
    this.props.setOriginCoords(this.childRef.getBoundingClientRect());
  }

  makeSmartChildren() {
    const {delay, setOriginCoords, children, hideOnFocus} = this.props;
    const child = Children.only(children);
    /**
     * A "controlled" tooltip is a tooltip which appears and disappears when you
     * ask it to.  It is controlled via the required `isOpen` boolean prop.  It's
     * useful for providing feedback in response to particular events rather than
     * hover/focus state.  If you want a tooltip that reacts to hover/focus state,
     * use the `Tooltip` component.
     */
    if (typeof this.props.isOpen === 'boolean') return child;
    return cloneElement(child, {
      onMouseEnter: (e) => {
        const clientRect = e.currentTarget.getBoundingClientRect();
        const handleMouseEnter = () => {
          this.setState({
            inToggle: true
          });
          setOriginCoords(clientRect);
        };
        const {onMouseEnter} = child.props;
        if (onMouseEnter) {
          onMouseEnter(e);
        }
        if (delay > 0 && delay <= MAX_INT) {
          this.delayTimer = setTimeout(handleMouseEnter, delay);
        } else {
          handleMouseEnter();
        }
      },
      onMouseLeave: (e) => {
        this.setState({
          inToggle: false
        });
        const {onMouseLeave} = child.props;
        if (onMouseLeave) {
          onMouseLeave(e);
        }
        clearTimeout(this.delayTimer);
      },
      onFocus: (e) => {
        const {onFocus} = child.props;
        if (onFocus) {
          onFocus(e);
        }
        if (hideOnFocus) {
          this.setState({
            inToggle: false
          });
          clearTimeout(this.delayTimer);
        }
      }
    });
  }

  // this is useful if the tooltip is positioned over the toggle due to small screens, etc.
  makeSmartTip() {
    const {tip} = this.props;
    const {inToggle} = this.state;
    return cloneElement(tip, {
      onMouseEnter: () => {
        if (!inToggle) {
          this.setState({
            inTip: true
          });
        }
      },
      onMouseLeave: () => {
        this.setState({
          inTip: false
        });
      }
    });
  }

  render() {
    const {coords, setModalRef} = this.props;
    const {inTip, inToggle} = this.state;
    const isOpen = inTip || inToggle || this.props.isOpen;
    return (
      <React.Fragment>
        <div ref={(c) => { this.childRef = c; }}>
          {this.makeSmartChildren()}
        </div>
        <TransitionGroup appear component={null}>
          {isOpen &&
          <AnimatedFade>
            <Modal>
              <ModalBlock style={coords} innerRef={setModalRef}>
                <ModalContents>
                  {this.makeSmartTip()}
                </ModalContents>
              </ModalBlock>
            </Modal>
          </AnimatedFade>
          }
        </TransitionGroup>
      </React.Fragment>
    );
  }
}

export default withCoordsV2(Tooltip);

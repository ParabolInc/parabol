import PropTypes from 'prop-types';
import React, {Children, cloneElement, Component} from 'react';
import TooltipModal from 'universal/components/Tooltip/TooltipModal';
import {MAX_INT} from 'universal/utils/constants';

class HoverTooltip extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    delay: PropTypes.number,
    hideOnFocus: PropTypes.bool,
    tip: PropTypes.any.isRequired,
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
  componentWillMount() {
    this.makeSmartChildren(this.props.children);
    this.makeSmartTip(this.props.tip);
  }

  componentWillReceiveProps(nextProps) {
    this.makeSmartChildren(nextProps.children);
    this.makeSmartTip(nextProps.tip);
  }

  makeSmartChildren(children) {
    const child = Children.only(children);
    this.children = cloneElement(child, {
      onMouseEnter: (e) => {
        const {delay, setOriginCoords} = this.props;
        const clientRect = e.currentTarget.getBoundingClientRect();
        const handleMouseEnter = () => {
          this.setState({
            inToggle: true,
            inTip: false
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
        const {hideOnFocus} = this.props;
        const {onFocus} = child.props;
        if (onFocus) {
          onFocus(e);
        }
        if (hideOnFocus) {
          this.setState({
            inToggle: false,
            inTip: false
          });
          clearTimeout(this.delayTimer);
        }
      }
    });
  }

  // this is useful if the tooltip is positioned over the toggle due to small screens, etc.
  makeSmartTip(tip) {
    this.tip = cloneElement(tip, {
      onMouseEnter: () => {
        this.setState({
          inToggle: false,
          inTip: true
        });
      },
      onMouseLeave: () => {
        this.setState({
          inTip: false
        });
      }
    });
  }

  render() {
    const {inTip, inToggle} = this.state;
    const isOpen = inTip || inToggle;
    return (
      <div>
        <TooltipModal {...this.props} isOpen={isOpen} tip={this.tip} />
        {this.children}
      </div>
    );
  }
}

export default HoverTooltip;

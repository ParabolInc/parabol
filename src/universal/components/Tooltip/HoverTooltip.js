import React, {Children, cloneElement, Component} from 'react';
import TooltipModal from 'universal/components/Tooltip/TooltipModal';
import PropTypes from 'prop-types';

class HoverTooltip extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    tip: PropTypes.any.isRequired,
    setOriginCoords: PropTypes.func.isRequired
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
        const {setOriginCoords} = this.props;
        this.setState({
          inToggle: true,
          inTip: false
        });
        setOriginCoords(e.currentTarget.getBoundingClientRect());

        // if the menu was gonna do something, do it
        const {onMouseEnter} = child.props;
        if (onMouseEnter) {
          onMouseEnter(e);
        }
      },
      onMouseLeave: () => {
        this.setState({
          inToggle: false
        });
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

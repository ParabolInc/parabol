import PropTypes from 'prop-types';
import React, {Component} from 'react';

import TooltipModal from 'universal/components/Tooltip/TooltipModal';

/**
 * A "controlled" tooltip is a tooltip which appears and disappears when you
 * ask it to.  It is controlled via the required `isOpen` boolean prop.  It's
 * useful for providing feedback in response to particular events rather than
 * hover/focus state.  If you want a tooltip that reacts to hover/focus state,
 * use the `Tooltip` component.
 */
class ControlledTooltip extends Component {
  static propTypes = {
    tip: PropTypes.element.isRequired,
    children: PropTypes.element.isRequired,
    setOriginCoords: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  };

  setOriginCoords = (containerEl) => {
    if (containerEl) {
      this.props.setOriginCoords(containerEl.getBoundingClientRect());
    }
  };

  render() {
    const {isOpen, children} = this.props;
    return isOpen ? (
      <div>
        <TooltipModal {...this.props} />
        <div ref={this.setOriginCoords}>{children}</div>
      </div>
    ) : (
      children
    );
  }
}

export default ControlledTooltip;

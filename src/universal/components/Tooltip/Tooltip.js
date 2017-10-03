import PropTypes from 'prop-types';
import React from 'react';

import ControlledTooltip from 'universal/components/Tooltip/ControlledTooltip';
import HoverTooltip from 'universal/components/Tooltip/HoverTooltip';

const Tooltip = (props) =>
  typeof props.isOpen === 'boolean' ? (
    <ControlledTooltip {...props} />
  ) : (
    <HoverTooltip {...props} />
  );

Tooltip.propTypes = {
  tip: PropTypes.element.isRequired,
  children: PropTypes.element.isRequired,
  setOriginCoords: PropTypes.func.isRequired,
  isOpen: PropTypes.bool
};

export default Tooltip;

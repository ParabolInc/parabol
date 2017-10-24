import PropTypes from 'prop-types';
import React from 'react';

import ControlledTooltip from 'universal/components/Tooltip/ControlledTooltip';
import HoverTooltip from 'universal/components/Tooltip/HoverTooltip';
import withCoords from 'universal/decorators/withCoords';

const Tooltip = (props) =>
  typeof props.isOpen === 'boolean' ? (
    <ControlledTooltip {...props} />
  ) : (
    <HoverTooltip {...props} />
  );

Tooltip.propTypes = {
  children: PropTypes.element.isRequired,
  delay: PropTypes.number,
  hideOnFocus: PropTypes.bool,
  isOpen: PropTypes.bool,
  setOriginCoords: PropTypes.func.isRequired,
  tip: PropTypes.element.isRequired
};

export default withCoords(Tooltip);

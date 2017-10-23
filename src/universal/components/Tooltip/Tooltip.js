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
  tip: PropTypes.element.isRequired,
  setOriginCoords: PropTypes.func.isRequired,
  isOpen: PropTypes.bool
};

export default withCoords(Tooltip);

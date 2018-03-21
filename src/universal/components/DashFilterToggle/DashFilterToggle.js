import PropTypes from 'prop-types';
import React from 'react';
import {Button} from 'universal/components';

const DashFilterToggle = (props) => {
  const {label, onClick} = props;
  return (
    <Button
      aria-label={`Filter by ${label}`}
      buttonSize="small"
      buttonStyle="link"
      colorPalette="midGray"
      icon="chevron-down"
      iconPlacement="right"
      label={label}
      onClick={onClick}
      title={`Filter by ${label}`}
    />
  );
};

DashFilterToggle.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func
};

export default DashFilterToggle;

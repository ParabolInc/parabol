import PropTypes from 'prop-types';
import React from 'react';
import {Button} from 'universal/components';

const DashNavControl = (props) => {
  const {
    icon,
    iconPlacement,
    label,
    onClick} = props;
  return (
    <Button
      aria-label={label}
      buttonSize="small"
      buttonStyle="link"
      colorPalette="midGray"
      icon={icon}
      iconPlacement={iconPlacement}
      label={label}
      onClick={onClick}
      title={label}
    />
  );
};

DashNavControl.propTypes = {
  icon: PropTypes.string,
  iconPlacement: PropTypes.oneOf([
    'left',
    'right'
  ]),
  label: PropTypes.string,
  onClick: PropTypes.func
};

export default DashNavControl;

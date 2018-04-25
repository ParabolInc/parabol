import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import styled from 'react-emotion';

const boxShadow = '1px 1px 2px rgba(0, 0, 0, .5)';

const BadgeRoot = styled('div')(({colorPalette, flat}) => ({
  backgroundColor: ui.palette[colorPalette] || ui.palette.warm,
  borderRadius: '1rem',
  boxShadow: !flat && boxShadow,
  color: ui.palette.white,
  fontSize: appTheme.typography.s1,
  fontWeight: 600,
  height: '1rem',
  lineHeight: '1rem',
  minWidth: '1rem',
  padding: '0 .25rem',
  textAlign: 'center'
}));

const Badge = (props) => <BadgeRoot {...props}>{props.value || 0}</BadgeRoot>;

Badge.propTypes = {
  colorPalette: PropTypes.oneOf([
    'cool',
    'dark',
    'mid',
    'midGray',
    'warm'
  ]),
  flat: PropTypes.bool,
  value: PropTypes.number
};

export default Badge;

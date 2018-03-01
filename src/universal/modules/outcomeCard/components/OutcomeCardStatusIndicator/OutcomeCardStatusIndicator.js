import PropTypes from 'prop-types';
import React from 'react';
import labels from 'universal/styles/theme/labels';
import styled from 'react-emotion';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';

const OutcomeCardStatusIndicator = styled('div')(({status}) => ({
  backgroundColor: labels.taskStatus[status].color,
  borderRadius: '.25rem',
  height: '.25rem',
  marginRight: '.3125rem',
  width: '1.875rem'
}));

OutcomeCardStatusIndicator.propTypes = {
  status: PropTypes.oneOf([
    ACTIVE,
    STUCK,
    DONE,
    FUTURE,
    'archived',
    'private'
  ])
};

export default OutcomeCardStatusIndicator;

import labels from 'universal/styles/theme/labels';
import styled from 'react-emotion';

const OutcomeCardStatusIndicator = styled('div')(({status}) => ({
  backgroundColor: labels.taskStatus[status].color,
  borderRadius: '.25rem',
  height: '.25rem',
  marginRight: '.3125rem',
  width: '1.875rem'
}));

export default OutcomeCardStatusIndicator;

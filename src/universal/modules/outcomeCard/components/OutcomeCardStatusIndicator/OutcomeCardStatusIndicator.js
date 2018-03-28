import labels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import styled from 'react-emotion';

const OutcomeCardStatusIndicator = styled('div')(({status}) => ({
  backgroundColor: labels.taskStatus[status].color,
  borderRadius: ui.cardStatusIndicatorHeight,
  height: ui.cardStatusIndicatorHeight,
  marginRight: '.3125rem',
  width: ui.cardStatusIndicatorWidth
}));

export default OutcomeCardStatusIndicator;

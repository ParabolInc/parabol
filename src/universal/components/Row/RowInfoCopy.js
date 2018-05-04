import ui from 'universal/styles/ui';
import styled from 'react-emotion';

const RowInfoCopy = styled('div')(({useHintCopy}) => ({
  ...ui.rowSubheading,
  color: useHintCopy && ui.hintColor
}));

export default RowInfoCopy;

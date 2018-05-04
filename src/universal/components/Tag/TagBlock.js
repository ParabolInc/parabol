import styled from 'react-emotion';
import ui from 'universal/styles/ui';

const TagBlock = styled('div')({
  display: 'inline-block',
  height: ui.tagHeight,
  lineHeight: ui.tagHeight,
  verticalAlign: 'middle'
});

export default TagBlock;

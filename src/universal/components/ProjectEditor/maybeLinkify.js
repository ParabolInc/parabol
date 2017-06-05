import getWordAt from './getWordAt';
import getAnchorLocation from 'universal/components/ProjectEditor/getAnchorLocation';
import makeAddLink from 'universal/components/ProjectEditor/operations/makeAddLink';
import linkify from 'universal/utils/linkify';

const maybeLinkify = (editorState) => {
  const {block, anchorOffset} = getAnchorLocation(editorState);
  const blockText = block.getText();
  const {begin, end, word} = getWordAt(blockText, anchorOffset, true);
  const entityKey = block.getEntityAt(anchorOffset);
  if (word && !entityKey) {
    const links = linkify.match(word);
    if (links) {
      const {url} = links[0];
      return makeAddLink(block.getKey(), begin, end, url);
    }
  }
  return undefined;
};

export default maybeLinkify;
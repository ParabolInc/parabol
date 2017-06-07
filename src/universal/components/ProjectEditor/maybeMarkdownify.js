import getWordAt from './getWordAt';
import getAnchorLocation from 'universal/components/ProjectEditor/getAnchorLocation';
import applyInlineStyle from 'universal/components/ProjectEditor/operations/applyInlineStyle';

// from ngs PR
const inlineMatchers = {
  BOLD: [
    /\*\*(\S[^(?:*)]+\S)\*\*/g,
    /__(\S[^(?:_)]+\S)__/g
  ],
  ITALIC: [
    /\*([^\s*][^*]+[^\s*])\*/g,
    /_([^\s_][^_]+[^\s_])_/g
  ],
  CODE: [
    /`([^`]+)`/g
  ],
  STRIKETHROUGH: [
    /~~(\S[^(?:~~)]+\S)~~/g
  ]
};
const styles = Object.keys(inlineMatchers);


const maybeMarkdownify = (editorState) => {
  const {block, anchorOffset} = getAnchorLocation(editorState);
  const blockText = block.getText();
  // -1 to remove the link from the current caret state
  const {begin, end, word} = getWordAt(blockText, anchorOffset - 1, true);
  const entityKey = block.getEntityAt(anchorOffset - 1);
  if (word && !entityKey) {
    for (let i = 0; i < styles.length; i++) {
      const style = styles[i];
      const styleRegexes = inlineMatchers[style];
      for (let j = 0; j < styleRegexes.lenght; j++) {
        const regex = styleRegexes[j];
        const match = regex.exec(word);
        if (match) {
          debugger
          return applyInlineStyle(block.getKey(), begin, end, style, match);
        }
      }
    }
  }
  return undefined;
};

export default maybeMarkdownify;
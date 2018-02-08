import {EditorState, Modifier} from 'draft-js';
import {List, Map, OrderedSet} from 'immutable';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import getAnchorLocation from 'universal/components/TaskEditor/getAnchorLocation';
import addSpace from 'universal/utils/draftjs/addSpace';
import splitBlock from 'universal/utils/draftjs/splitBlock';
import linkify from 'universal/utils/linkify';

const inlineMatchers = {
  CODE: {regex: /`([^`]+)`/, matchIdx: 1},
  BOLD: {regex: /(\*\*|__)(.*?)\1/, matchIdx: 2},
  ITALIC: {regex: /([*_])(.*?)\1/, matchIdx: 2},
  STRIKETHROUGH: {regex: /(~+)([^~\s]+)\1/, matchIdx: 2}
};

const blockQuoteRegex = /^(\s*>\s*)(.*)$/;
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;


const CODE_FENCE = '```';

const styles = Object.keys(inlineMatchers);

const extractStyle = (editorState, getNextState, style, blockKey, extractedStyles) => {
  const {regex, matchIdx} = inlineMatchers[style];
  const blockText = editorState.getCurrentContent().getBlockForKey(blockKey).getText();
  const result = regex.exec(blockText);
  if (result) {
    const es = extractedStyles.length === 0 ? getNextState() : editorState;
    const contentState = es.getCurrentContent();
    const selectionState = es.getSelection();
    const beforePhrase = result[0];
    const afterPhrase = result[matchIdx];
    const selectionToReplace = selectionState.merge({
      anchorKey: blockKey,
      focusKey: blockKey,
      anchorOffset: result.index,
      focusOffset: result.index + beforePhrase.length
    });
    // style **`b`** not `**b**`
    if (extractedStyles.indexOf('CODE') !== -1) {
      const hasCode = contentState.getBlockForKey(blockKey).getInlineStyleAt(result.index).has('CODE');
      if (hasCode) return editorState;
    }
    extractedStyles.push(style);

    const phraseShrink = beforePhrase.length - afterPhrase.length;
    // if it's a split block, then go to 0
    const nextCaret = selectionState.getAnchorKey() === blockKey ? selectionState.getFocusOffset() - phraseShrink : 0;
    const selectionAfter = selectionState.merge({
      anchorOffset: nextCaret,
      focusOffset: nextCaret
    });

    const markdownedContent = Modifier.replaceText(
      contentState,
      selectionToReplace,
      afterPhrase,
      OrderedSet.of(...extractedStyles)
    ).merge({
      selectionAfter
    });
    return EditorState.push(es, markdownedContent, 'change-inline-style');
  }
  return editorState;
};

const extractMarkdownStyles = (editorState, getNextState, blockKey) => {
  const extractedStyles = [];
  let es = editorState;
  for (let i = 0; i < styles.length; i++) {
    es = extractStyle(es, getNextState, styles[i], blockKey, extractedStyles);
  }
  if (es !== editorState) {
    // squash the undo stack so hitting undo (or transitively backspace) undoes all the styling
    const undoStack = es.getUndoStack();
    return EditorState.set(es, {
      undoStack: undoStack.slice(extractedStyles.length - 1),
      currentContent: es.getCurrentContent().merge({
        selectionBefore: undoStack.get(extractedStyles.length - 1).getSelectionAfter()
      }),
      inlineStyleOverride: OrderedSet()
    });
  }
  return undefined;
};

const doUndo = (editorState, count) => {
  const nextEditorState = EditorState.undo(editorState);
  return count === 1 ? nextEditorState : doUndo(nextEditorState, count - 1);
};

const withMarkdown = (ComposedComponent) => {
  return class WithMarkdown extends Component {
    static propTypes = {
      editorState: PropTypes.object.isRequired,
      handleBeforeInput: PropTypes.func,
      handleChange: PropTypes.func,
      handleKeyCommand: PropTypes.func,
      keyBindingFn: PropTypes.func,
      removeModal: PropTypes.func,
      renderModal: PropTypes.func,
      setEditorState: PropTypes.func.isRequired
    };

    state = {};

    getMaybeMarkdownState = (getNextState, editorState) => {
      this.undoMarkdown = undefined;
      const {block, anchorOffset} = getAnchorLocation(editorState);
      const blockKey = block.getKey();
      const entityKey = block.getEntityAt(anchorOffset - 1);
      if (!entityKey) {
        const result = extractMarkdownStyles(editorState, getNextState, blockKey);
        if (result) {
          this.undoMarkdown = true;
          return result;
        }
      }
      return this.getMaybeCodeBlockState(editorState);
    };

    getMaybeCodeBlockState = (editorState) => {
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const currentBlockKey = selectionState.getAnchorKey();
      const currentBlock = contentState.getBlockForKey(currentBlockKey);
      const currentBlockText = currentBlock.getText();
      if (!currentBlockText.startsWith(CODE_FENCE) || selectionState.getAnchorOffset() < 3) return undefined;
      const lastCodeBlock = contentState.getBlockBefore(currentBlockKey);
      let cb = lastCodeBlock;
      while (cb) {
        if (cb.getText().startsWith(CODE_FENCE)) {
          break;
        }
        cb = contentState.getBlockBefore(cb.getKey());
      }
      if (!cb) return undefined;
      const blockMap = contentState.getBlockMap();
      const updatedLastline = blockMap.get(currentBlockKey).merge({
        text: '',
        characterList: List(),
        data: Map()
      });
      const contentStateWithoutFences = contentState.merge({
        blockMap: blockMap
          .set(currentBlockKey, updatedLastline)
          .delete(cb.getKey())
      });
      const firstCodeBlock = contentState.getBlockAfter(cb.getKey());
      const selectedCode = selectionState.merge({
        anchorOffset: 0,
        focusOffset: lastCodeBlock.getLength(),
        anchorKey: firstCodeBlock.getKey(),
        focusKey: lastCodeBlock.getKey()
      });

      const styledContent = Modifier
        .setBlockType(contentStateWithoutFences, selectedCode, 'code-block')
        .merge({
          selectionAfter: selectionState.merge({
            anchorOffset: 0,
            focusOffset: 0
          })
        });
      return EditorState.push(editorState, styledContent, 'change-block-type');
    };

    getMaybeBlockquote = (editorState, command) => {
      const initialContentState = editorState.getCurrentContent();
      const initialSelectionState = editorState.getSelection();
      const currentBlockKey = initialSelectionState.getAnchorKey();
      const currentBlock = initialContentState.getBlockForKey(currentBlockKey);
      const currentBlockText = currentBlock.getText();
      const matchedBlockQuote = blockQuoteRegex.exec(currentBlockText);
      if (!matchedBlockQuote) return undefined;
      // now that we're doing something, let's spend the cycles and manually exec the command
      const addWhiteSpace = command === 'split-block' ? splitBlock : addSpace;
      const preSplitES = addWhiteSpace(editorState);
      const startingEditorState = EditorState.set(preSplitES, {
        selection: editorState.getSelection()
        // currentContent: preSplitES.getCurrentContent().merge({
        //  selectionAfter: editorState.getSelection()
        // })
      });
      const contentState = startingEditorState.getCurrentContent();
      const selectionState = startingEditorState.getSelection();
      const triggerPhrase = matchedBlockQuote[1];
      const selectionToRemove = selectionState.merge({
        anchorOffset: 0,
        focusOffset: triggerPhrase.length
      });
      const contentWithoutTrigger = Modifier.removeRange(
        contentState,
        selectionToRemove,
        'forward'
      );
      const fullBlockSelection = selectionToRemove.merge({
        focusOffset: currentBlock.getLength()
      });
      const styledContent = Modifier
        .setBlockType(contentWithoutTrigger, fullBlockSelection, 'blockquote')
        .merge({
          selectionAfter: fullBlockSelection.merge({
            anchorOffset: fullBlockSelection.getFocusOffset()
          })
        });
      return EditorState.push(startingEditorState, styledContent, 'change-block-type');
    };

    getMaybeLink = (editorState, command) => {
      const initialContentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const currentBlockKey = selectionState.getAnchorKey();
      const currentBlock = initialContentState.getBlockForKey(currentBlockKey);
      const textToLeft = currentBlock.getText().slice(0, selectionState.getAnchorOffset());
      const matchedLink = linkRegex.exec(textToLeft);
      if (!matchedLink) return undefined;
      // now that we're doing something, let's spend the cycles and manually exec the command
      const addWhiteSpace = command === 'split-block' ? splitBlock : addSpace;
      const preSplitES = addWhiteSpace(editorState);
      const contentState = preSplitES.getCurrentContent();
      const [phrase, text, link] = matchedLink;
      const selectionToRemove = selectionState.merge({
        anchorOffset: matchedLink.index,
        focusOffset: matchedLink.index + phrase.length
      });
      const href = linkify.match(link)[0].url;
      const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', {href});
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const linkifiedContent = Modifier.replaceText(
        contentState,
        selectionToRemove,
        text,
        null,
        entityKey
      );

      const selectionAfter = command === 'split-block' ? preSplitES.getSelection() :
        linkifiedContent.getSelectionAfter().merge({
          anchorOffset: linkifiedContent.getSelectionAfter().getAnchorOffset() + 1,
          focusOffset: linkifiedContent.getSelectionAfter().getAnchorOffset() + 1
        });
      const adjustedSelectionContent = linkifiedContent.merge({
        selectionAfter,
        selectionBefore: selectionAfter
      });
      this.undoMarkdown = true;
      return EditorState.push(preSplitES, adjustedSelectionContent, 'apply-entity');
    };

    handleKeyCommand = (command) => {
      const {handleKeyCommand, editorState, setEditorState} = this.props;
      if (handleKeyCommand) {
        const result = handleKeyCommand(command);
        if (result === 'handled' || result === true) {
          return result;
        }
      }
      if (command === 'split-block') {
        const getNextState = () => splitBlock(editorState);
        const updatedEditorState =
          this.getMaybeMarkdownState(getNextState, editorState) ||
          this.getMaybeBlockquote(editorState, command) ||
          this.getMaybeLink(editorState, command);
        if (updatedEditorState) {
          setEditorState(updatedEditorState);
          return 'handled';
        }
      }

      if (command === 'backspace' && this.undoMarkdown) {
        setEditorState(EditorState.undo(editorState));
        this.undoMarkdown = undefined;
        return 'handled';
      }
      return undefined;
    };

    keyBindingFn = (e) => {
      const {keyBindingFn} = this.props;
      if (keyBindingFn) {
        const result = keyBindingFn(e);
        if (result) {
          return result;
        }
      }
      return undefined;
    };

    handleBeforeInput = (char) => {
      const {handleBeforeInput, editorState, setEditorState} = this.props;
      if (handleBeforeInput) {
        const result = handleBeforeInput(char);
        if (result === 'handled' || result === true) {
          return result;
        }
      }
      if (char === ' ') {
        const getNextState = () => addSpace(editorState);
        const updatedEditorState = this.getMaybeMarkdownState(getNextState, editorState) ||
          this.getMaybeBlockquote(editorState, 'space') ||
          this.getMaybeLink(editorState, 'space');
        if (updatedEditorState) {
          setEditorState(updatedEditorState);
          return 'handled';
        }
      }
      return undefined;
    };

    handleChange = (editorState) => {
      const {handleChange} = this.props;
      if (handleChange) {
        handleChange(editorState);
      }
      this.undoMarkdown = undefined;
    };

    render() {
      return (<ComposedComponent
        {...this.props}
        handleBeforeInput={this.handleBeforeInput}
        handleChange={this.handleChange}
        handleKeyCommand={this.handleKeyCommand}
        keyBindingFn={this.keyBindingFn}
      />);
    }
  };
};

export default withMarkdown;

// **`b`** = bold code b
// `**b**` = code **b**

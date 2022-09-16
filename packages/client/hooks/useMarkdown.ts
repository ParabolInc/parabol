import {
  ContentBlock,
  ContentState,
  DraftEditorCommand,
  EditorProps,
  EditorState,
  Modifier,
  SelectionState
} from 'draft-js'
import {List, Map, OrderedSet} from 'immutable'
import {useRef} from 'react'
import getAnchorLocation from '../components/TaskEditor/getAnchorLocation'
import {SetEditorState} from '../types/draft'
import addSpace from '../utils/draftjs/addSpace'
import splitBlock from '../utils/draftjs/splitBlock'
import linkify from '../utils/linkify'

const inlineMatchers = {
  CODE: {regex: /`([^`]+)`/, matchIdx: 1},
  BOLD: {regex: /(\*\*|__)(.*?)\1/, matchIdx: 2},
  ITALIC: {regex: /([*_])(.*?)\1/, matchIdx: 2},
  STRIKETHROUGH: {regex: /(~+)([^~\s]+)\1/, matchIdx: 2}
}

const blockQuoteRegex = /^(\s*>\s*)(.*)$/
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/

const CODE_FENCE = '```'

const styles = Object.keys(inlineMatchers) as (keyof typeof inlineMatchers)[]

const extractStyle = (
  editorState: EditorState,
  getNextState: () => EditorState,
  style: keyof typeof inlineMatchers,
  blockKey: string,
  extractedStyles: typeof styles
) => {
  const {regex, matchIdx} = inlineMatchers[style]
  const blockText = editorState.getCurrentContent().getBlockForKey(blockKey).getText()
  const result = regex.exec(blockText)
  if (result) {
    const es = extractedStyles.length === 0 ? getNextState() : editorState
    const contentState = es.getCurrentContent()
    const selectionState = es.getSelection()
    const beforePhrase = result[0]!
    const afterPhrase = result[matchIdx] ?? ''
    const selectionToReplace = selectionState.merge({
      anchorKey: blockKey,
      focusKey: blockKey,
      anchorOffset: result.index,
      focusOffset: result.index + beforePhrase.length
    }) as SelectionState
    // style **`b`** not `**b**`
    if (extractedStyles.indexOf('CODE') !== -1) {
      const hasCode = contentState
        .getBlockForKey(blockKey)
        .getInlineStyleAt(result.index)
        .has('CODE')
      if (hasCode) return editorState
    }
    extractedStyles.push(style)

    const phraseShrink = beforePhrase.length - afterPhrase.length
    // if it's a split block, then go to 0
    const nextCaret =
      selectionState.getAnchorKey() === blockKey
        ? selectionState.getFocusOffset() - phraseShrink
        : 0
    const selectionAfter = selectionState.merge({
      anchorOffset: nextCaret,
      focusOffset: nextCaret
    })

    const markdownedContent = Modifier.replaceText(
      contentState,
      selectionToReplace,
      afterPhrase,
      OrderedSet.of(...extractedStyles)
    ).merge({
      selectionAfter
    }) as ContentState
    return EditorState.push(es, markdownedContent, 'change-inline-style')
  }
  return editorState
}

const extractMarkdownStyles = (
  editorState: EditorState,
  getNextState: () => EditorState,
  blockKey: string
) => {
  const extractedStyles = []
  let es = editorState
  styles.forEach((style) => {
    es = extractStyle(es, getNextState, style, blockKey, extractedStyles)
  })
  if (es !== editorState) {
    // squash the undo stack so hitting undo (or transitively backspace) undoes all the styling
    const undoStack = es.getUndoStack()
    return EditorState.set(es, {
      undoStack: undoStack.slice(extractedStyles.length - 1),
      currentContent: es.getCurrentContent().merge({
        selectionBefore: undoStack.get(extractedStyles.length - 1).getSelectionAfter()
      }),
      inlineStyleOverride: OrderedSet()
    })
  }
  return undefined
}

type Handlers = Pick<EditorProps, 'handleKeyCommand' | 'keyBindingFn' | 'handleBeforeInput'> & {
  onChange?: EditorProps['onChange']
}
const useMarkdown = (
  editorState: EditorState,
  setEditorState: SetEditorState,
  {handleKeyCommand, keyBindingFn, handleBeforeInput, onChange}: Handlers
) => {
  const undoMarkdownRef = useRef<undefined | boolean>(false)

  const getMaybeCodeBlockState = (editorState: EditorState) => {
    const contentState = editorState.getCurrentContent()
    const selectionState = editorState.getSelection()
    const currentBlockKey = selectionState.getAnchorKey()
    const currentBlock = contentState.getBlockForKey(currentBlockKey)
    const currentBlockText = currentBlock.getText()
    if (!currentBlockText.startsWith(CODE_FENCE) || selectionState.getAnchorOffset() < 3) {
      return undefined
    }
    const lastCodeBlock = contentState.getBlockBefore(currentBlockKey)
    let cb = lastCodeBlock
    while (cb) {
      if (cb.getText().startsWith(CODE_FENCE)) {
        break
      }
      cb = contentState.getBlockBefore(cb.getKey())
    }
    if (!cb || !lastCodeBlock) return undefined
    const blockMap = contentState.getBlockMap()
    const updatedLastline = blockMap.get(currentBlockKey).merge({
      text: '',
      characterList: List(),
      data: Map()
    }) as ContentBlock
    const contentStateWithoutFences = contentState.merge({
      blockMap: blockMap.set(currentBlockKey, updatedLastline).delete(cb.getKey()) as ContentState
    }) as ContentState
    const firstCodeBlock = contentState.getBlockAfter(cb.getKey())!
    const selectedCode = selectionState.merge({
      anchorOffset: 0,
      focusOffset: lastCodeBlock.getLength(),
      anchorKey: firstCodeBlock.getKey(),
      focusKey: lastCodeBlock.getKey()
    }) as SelectionState

    const styledContent = Modifier.setBlockType(
      contentStateWithoutFences,
      selectedCode,
      'code-block'
    ).merge({
      selectionAfter: selectionState.merge({
        anchorOffset: 0,
        focusOffset: 0
      })
    }) as ContentState
    return EditorState.push(editorState, styledContent, 'change-block-type')
  }

  const getMaybeMarkdownState = (getNextState: () => EditorState, editorState: EditorState) => {
    undoMarkdownRef.current = undefined
    const {block, anchorOffset} = getAnchorLocation(editorState)
    const blockKey = block.getKey()
    const entityKey = block.getEntityAt(anchorOffset - 1)
    if (!entityKey) {
      const result = extractMarkdownStyles(editorState, getNextState, blockKey)
      if (result) {
        undoMarkdownRef.current = true
        return result
      }
    }
    return getMaybeCodeBlockState(editorState)
  }

  const getMaybeBlockquote = (editorState: EditorState, command: DraftEditorCommand | 'space') => {
    const initialContentState = editorState.getCurrentContent()
    const initialSelectionState = editorState.getSelection()
    const currentBlockKey = initialSelectionState.getAnchorKey()
    const currentBlock = initialContentState.getBlockForKey(currentBlockKey)
    const currentBlockText = currentBlock.getText()
    const matchedBlockQuote = blockQuoteRegex.exec(currentBlockText)
    if (!matchedBlockQuote) return undefined
    // now that we're doing something, let's spend the cycles and manually exec the command
    const addWhiteSpace = command === 'split-block' ? splitBlock : addSpace
    const preSplitES = addWhiteSpace(editorState)
    const startingEditorState = EditorState.set(preSplitES, {
      selection: editorState.getSelection()
      // currentContent: preSplitES.getCurrentContent().merge({
      //  selectionAfter: editorState.getSelection()
      // })
    })
    const contentState = startingEditorState.getCurrentContent()
    const selectionState = startingEditorState.getSelection()
    const triggerPhrase = matchedBlockQuote[1]
    const selectionToRemove = selectionState.merge({
      anchorOffset: 0,
      focusOffset: triggerPhrase?.length
    }) as SelectionState
    const contentWithoutTrigger = Modifier.removeRange(contentState, selectionToRemove, 'forward')
    const fullBlockSelection = selectionToRemove.merge({
      focusOffset: currentBlock.getLength()
    }) as SelectionState
    const styledContent = Modifier.setBlockType(
      contentWithoutTrigger,
      fullBlockSelection,
      'blockquote'
    ).merge({
      selectionAfter: fullBlockSelection.merge({
        anchorOffset: fullBlockSelection.getFocusOffset()
      })
    }) as ContentState
    return EditorState.push(startingEditorState, styledContent, 'change-block-type')
  }

  const getMaybeLink = (editorState: EditorState, command: DraftEditorCommand | 'space') => {
    const initialContentState = editorState.getCurrentContent()
    const selectionState = editorState.getSelection()
    const currentBlockKey = selectionState.getAnchorKey()
    const currentBlock = initialContentState.getBlockForKey(currentBlockKey)
    const textToLeft = currentBlock.getText().slice(0, selectionState.getAnchorOffset())
    const matchedLink = linkRegex.exec(textToLeft)
    if (!matchedLink) return undefined
    // now that we're doing something, let's spend the cycles and manually exec the command
    const [phrase, text, link] = matchedLink as string[] as [string, string, string]
    const addWhiteSpace = command === 'split-block' ? splitBlock : addSpace
    const preSplitES = addWhiteSpace(editorState)
    const contentState = preSplitES.getCurrentContent()
    const selectionToRemove = selectionState.merge({
      anchorOffset: matchedLink.index,
      focusOffset: matchedLink.index + phrase.length
    }) as SelectionState
    const href = linkify.match(link)![0]!.url
    const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', {href})
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const linkifiedContent = Modifier.replaceText(
      contentState,
      selectionToRemove,
      text,
      undefined,
      entityKey
    )

    const selectionAfter =
      command === 'split-block'
        ? preSplitES.getSelection()
        : linkifiedContent.getSelectionAfter().merge({
            anchorOffset: linkifiedContent.getSelectionAfter().getAnchorOffset() + 1,
            focusOffset: linkifiedContent.getSelectionAfter().getAnchorOffset() + 1
          })
    const adjustedSelectionContent = linkifiedContent.merge({
      selectionAfter,
      selectionBefore: selectionAfter
    }) as ContentState
    undoMarkdownRef.current = true
    return EditorState.push(preSplitES, adjustedSelectionContent, 'apply-entity')
  }

  const nextHandleKeyCommand: EditorProps['handleKeyCommand'] = (command: DraftEditorCommand) => {
    if (handleKeyCommand) {
      // @ts-ignore
      const result = handleKeyCommand(command)
      // @ts-ignore
      if (result === 'handled' || result === true) {
        return result
      }
    }
    if (command === 'split-block') {
      const getNextState = () => splitBlock(editorState)
      const updatedEditorState =
        getMaybeMarkdownState(getNextState, editorState) ||
        getMaybeBlockquote(editorState, command) ||
        getMaybeLink(editorState, command)
      if (updatedEditorState) {
        setEditorState(updatedEditorState)
        return 'handled'
      }
    }

    if (command === 'backspace' && undoMarkdownRef.current) {
      setEditorState(EditorState.undo(editorState))
      undoMarkdownRef.current = undefined
      return 'handled'
    }
    return 'not-handled'
  }

  const nextKeyBindingFn: EditorProps['keyBindingFn'] = (e) => {
    if (keyBindingFn) {
      const result = keyBindingFn(e)
      if (result) {
        return result
      }
    }
    return null
  }

  const nextHandleBeforeInput: EditorProps['handleBeforeInput'] = (char) => {
    if (handleBeforeInput) {
      // @ts-ignore
      const result = handleBeforeInput(char)
      // @ts-ignore
      if (result === 'handled' || result === true) {
        return result
      }
    }
    if (char === ' ') {
      const getNextState = () => addSpace(editorState)
      const updatedEditorState =
        getMaybeMarkdownState(getNextState, editorState) ||
        getMaybeBlockquote(editorState, 'space') ||
        getMaybeLink(editorState, 'space')
      if (updatedEditorState) {
        setEditorState(updatedEditorState)
        return 'handled'
      }
    }
    return 'not-handled'
  }

  const nextOnChange: EditorProps['onChange'] = (editorState: EditorState) => {
    if (onChange) {
      onChange(editorState)
    }
    undoMarkdownRef.current = undefined
  }

  return {
    onChange: nextOnChange,
    keyBindingFn: nextKeyBindingFn,
    handleBeforeInput: nextHandleBeforeInput,
    handleKeyCommand: nextHandleKeyCommand
  }
}

export default useMarkdown

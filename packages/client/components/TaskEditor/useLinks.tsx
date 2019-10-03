import {DraftEditorCommand, EditorProps, EditorState, KeyBindingUtil, SelectionState} from 'draft-js'
import React, {ReactNode, RefObject, useRef, useState} from 'react'
import getAnchorLocation from './getAnchorLocation'
import getSelectionLink from './getSelectionLink'
import getSelectionText from './getSelectionText'
import getWordAt from './getWordAt'
import {DEFAULT_MENU_HEIGHT, DEFAULT_MENU_WIDTH, HUMAN_ADDICTION_THRESH, MAX_WAIT_TIME} from '../../styles/ui'
import addSpace from '../../utils/draftjs/addSpace'
import getFullLinkSelection from '../../utils/draftjs/getFullLinkSelection'
import makeAddLink from '../../utils/draftjs/makeAddLink'
import splitBlock from '../../utils/draftjs/splitBlock'
import getDraftCoords from '../../utils/getDraftCoords'
import linkify from '../../utils/linkify'
import Loadable from 'react-loadable'
import LoadableLoading from '../LoadableLoading'
import LoadableDraftJSModal from '../LoadableDraftJSModal'
import {SetEditorState} from '../../types/draft'
import {UseTaskChild} from '../../hooks/useTaskChildFocus'
import useForceUpdate from '../../hooks/useForceUpdate'

const LoadableEditorLinkChanger = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: 'EditorLinkChanger' */
      '../../../client/components/EditorLinkChanger/EditorLinkChanger'
      ),
  loading: (props) => (
    <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH}/>
  ),
  delay: HUMAN_ADDICTION_THRESH,
  timeout: MAX_WAIT_TIME
})

const LoadableEditorLinkViewer = Loadable({
  loader: () =>
    import(
      /* webpackChunkName: 'EditorLinkViewer' */
      '../../../client/components/EditorLinkViewer/EditorLinkViewer'
      ),
  loading: (props) => (
    <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH}/>
  ),
  delay: HUMAN_ADDICTION_THRESH,
  timeout: MAX_WAIT_TIME
})

const originAnchor = {
  vertical: 'top',
  horizontal: 'left'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'left'
}

const getEntityKeyAtCaret = (editorState: EditorState) => {
  const selectionState = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const anchorOffset = selectionState.getAnchorOffset()
  const blockKey = selectionState.getAnchorKey()
  const block = contentState.getBlockForKey(blockKey)
  return block.getEntityAt(anchorOffset - 1)
}

const getCtrlKSelection = (editorState: EditorState) => {
  const selectionState = editorState.getSelection()
  if (selectionState.isCollapsed()) {
    const entityKey = getEntityKeyAtCaret(editorState)
    if (entityKey) {
      return getFullLinkSelection(editorState)
    }
    const {block, anchorOffset} = getAnchorLocation(editorState)
    const blockText = block.getText()
    const {word, begin, end} = getWordAt(blockText, anchorOffset - 1)
    if (word) {
      return selectionState.merge({
        anchorOffset: begin,
        focusOffset: end
      })
    }
  }
  return selectionState
}

const {hasCommandModifier} = KeyBindingUtil

interface CustomProps {
  removeModal?: () => void
  renderModal?: () => ReactNode
  editorRef: RefObject<HTMLTextAreaElement>
  useTaskChild: UseTaskChild
}

type Handlers = Pick<EditorProps, 'handleBeforeInput' | 'onChange' | 'handleKeyCommand' | 'keyBindingFn'> & CustomProps

interface ViewerData {
  href: string
  text: string
  selectionState: SelectionState
}

const useLinks = (editorState: EditorState, setEditorState: SetEditorState, handlers: Handlers) => {
  const {handleBeforeInput, keyBindingFn, handleKeyCommand, onChange, removeModal, renderModal, useTaskChild} = handlers
  const undoLinkRef = useRef(false)
  const cachedCoordsRef = useRef<ClientRect | null>(null)
  const editorRef = useRef<HTMLElement>()
  const [linkViewerData, setLinkViewerData] = useState<ViewerData | undefined>()
  const [linkChangerData, setLinkChangerData] = useState()
  const forceUpdate = useForceUpdate()
  const onRemoveModal = (allowFocus?: boolean) => {
    // LinkChanger can take focus, so sometimes we don't want to blur
    if (!linkChangerData || allowFocus) {
      cachedCoordsRef.current = null
      setLinkChangerData(undefined)
      setLinkViewerData(undefined)
    }
  }

  const getMaybeLinkifiedState = (getNextState, editorState) => {
    undoLinkRef.current = false
    const {block, anchorOffset} = getAnchorLocation(editorState)
    const blockText = block.getText()
    // -1 to remove the link from the current caret state
    const {begin, end, word} = getWordAt(blockText, anchorOffset - 1, true)
    if (!word) return undefined
    const entityKey = block.getEntityAt(anchorOffset - 1)

    if (entityKey) {
      const contentState = editorState.getCurrentContent()
      const entity = contentState.getEntity(entityKey)
      if (entity.getType() === 'LINK') {
        // the character that is to the left of the caret is a link
        //  const {begin, end, word} = getWordAt(blockText, anchorOffset, true);
        const entityKeyToRight = block.getEntityAt(anchorOffset)
        // if they're putting a space within the link, keep it contiguous
        if (entityKey !== entityKeyToRight) {
          // hitting space should close the modal
          if (removeModal) {
            if (renderModal) {
              removeModal()
            } else if (linkViewerData || linkChangerData) {
              onRemoveModal()
            }
          }
          return getNextState()
        }
      }
    } else {
      const links = linkify.match(word)
      // make sure the link starts at the beginning of the word otherwise we get conflicts with markdown and junk
      if (links && links[0].index === 0) {
        const {url} = links[0]
        const linkifier = makeAddLink(block.getKey(), begin, end, url)
        undoLinkRef.current = true
        // getNextState is a thunk because 99% of the time, we won't ever use it,
        return linkifier(getNextState())
      }
    }
    return undefined
  }

  const onHandleBeforeInput: Handlers['handleBeforeInput'] = (char: string) => {
    if (handleBeforeInput) {
      const result = handleBeforeInput(char, editorState, Date.now())
      // @ts-ignore
      if (result === 'handled' || result === true) {
        return result
      }
    }
    if (char === ' ') {
      const getNextState = () => addSpace(editorState)
      const nextEditorState = getMaybeLinkifiedState(getNextState, editorState)
      if (nextEditorState) {
        setEditorState(nextEditorState)
        return 'handled'
      }
    }
    return 'not-handled'
  }

  const handleChange = (editorState: EditorState) => {
    if (onChange) {
      onChange(editorState)
    }
    undoLinkRef.current = false
    const {block, anchorOffset} = getAnchorLocation(editorState)
    const entityKey = block.getEntityAt(Math.max(0, anchorOffset - 1))
    if (entityKey && !linkChangerData) {
      const contentState = editorState.getCurrentContent()
      const entity = contentState.getEntity(entityKey)
      if (entity.getType() === 'LINK') {
        setLinkViewerData(entity.getData())
        return
      }
    }
    if (linkViewerData) {
      onRemoveModal()
    }
  }

  const addHyperlink = () => {
    const selectionState = getCtrlKSelection(editorState)
    const text = getSelectionText(editorState, selectionState)
    const link = getSelectionLink(editorState, selectionState)
    setLinkViewerData(undefined)
    setLinkChangerData({
      link,
      text,
      selectionState
    })
  }

  const onKeyCommand: Handlers['handleKeyCommand'] = (command: DraftEditorCommand | 'add-hyperlink') => {
    if (handleKeyCommand) {
      const result = handleKeyCommand(command, editorState, Date.now())
      // @ts-ignore
      if (result === 'handled' || result === true) {
        return result
      }
    }

    if (command === 'split-block') {
      const getNextState = () => splitBlock(editorState)
      const nextEditorState = getMaybeLinkifiedState(getNextState, editorState)
      if (nextEditorState) {
        setEditorState(nextEditorState)
        return 'handled'
      }
    }

    if (command === 'backspace' && undoLinkRef.current) {
      setEditorState(EditorState.undo(editorState))
      undoLinkRef.current = false
      return 'handled'
    }

    if (command === 'add-hyperlink') {
      addHyperlink()
      return 'handled'
    }
    return 'not-handled'
  }

  const renderChangerModal = () => {
    const {text, link, selectionState} = linkChangerData
    const coords = getDraftCoords()
    // in this case, coords can be good, then bad as soon as the changer takes focus
    // so, the container must handle bad then good as well as good then bad
    if (coords) {
      cachedCoordsRef.current = coords
    }
    if (!cachedCoordsRef.current) {
      setTimeout(forceUpdate)
      return null
    }
    // keys are very important because all modals feed into the same renderModal, which could replace 1 with the other
    return (
      <LoadableDraftJSModal
        key='EditorLinkChanger'
        LoadableComponent={LoadableEditorLinkChanger}
        maxWidth={320}
        maxHeight={200}
        originAnchor={originAnchor}
        queryVars={{
          editorState,
          selectionState,
          setEditorState,
          removeModal: onRemoveModal,
          text,
          link,
          initialValues: {text, link},
          editorRef,
          useTaskChild
        }}
        targetAnchor={targetAnchor}
        marginFromOrigin={32}
        originCoords={cachedCoordsRef.current}
      />
    )
  }

  const renderViewerModal = () => {
    const coords = getDraftCoords()
    if (!coords) {
      setTimeout(forceUpdate)
      return null
    }
    if (!linkViewerData) return null
    return (
      <LoadableDraftJSModal
        key='EditorLinkViewer'
        LoadableComponent={LoadableEditorLinkViewer}
        maxWidth={400}
        maxHeight={100}
        originAnchor={originAnchor}
        queryVars={{
          editorState,
          setEditorState,
          removeModal: onRemoveModal,
          href: linkViewerData.href,
          addHyperlink: addHyperlink
        }}
        targetAnchor={targetAnchor}
        marginFromOrigin={32}
        originCoords={coords}
      />
    )
  }

  const handleKeyBindingFn: Handlers['keyBindingFn'] = (e) => {
    if (keyBindingFn) {
      const result = keyBindingFn(e)
      if (result) {
        return result
      }
    }
    if (e.key === 'k' && hasCommandModifier(e)) {
      return 'add-hyperlink'
    }
    return null
  }

  return {
    handleBeforeInput: onHandleBeforeInput,
    handleChange,
    handleKeyCommand: onKeyCommand,
    keyBindingFn: handleKeyBindingFn,
    renderModal: linkViewerData ? renderViewerModal : linkChangerData ? renderChangerModal : renderModal,
    removeModal: linkViewerData || linkChangerData ? onRemoveModal : removeModal
  }
}

export default useLinks

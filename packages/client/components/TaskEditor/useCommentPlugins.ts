import {EditorProps, EditorState} from 'draft-js'
import {RefObject} from 'react'
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts'
import useMarkdown from '../../hooks/useMarkdown'
import {SetEditorState} from '../../types/draft'
import useEmojis from './useEmojis'
import useLinks from './useLinks'
import useSuggestions from './useSuggestions'

type Handlers = Pick<
  EditorProps,
  'handleKeyCommand' | 'keyBindingFn' | 'handleBeforeInput' | 'handleReturn'
>

interface CustomProps {
  editorState: EditorState
  setEditorState: SetEditorState
  editorRef: RefObject<HTMLTextAreaElement>
  teamId: string
}

type Props = Handlers & CustomProps

const useCommentPlugins = (props: Props) => {
  const {
    editorState,
    handleReturn,
    keyBindingFn,
    handleKeyCommand,
    handleBeforeInput,
    setEditorState,
    editorRef,
    teamId
  } = props
  const ks = useKeyboardShortcuts(editorState, setEditorState, {handleKeyCommand, keyBindingFn})
  const md = useMarkdown(editorState, setEditorState, {
    handleKeyCommand: ks.handleKeyCommand,
    keyBindingFn: ks.keyBindingFn,
    handleBeforeInput
  })
  const sug = useSuggestions(
    editorState,
    setEditorState,
    {
      handleReturn,
      teamId,
      keyBindingFn: md.keyBindingFn,
      onChange: md.onChange
    },
    {excludeTags: true}
  )
  const emoji = useEmojis(editorState, setEditorState, {
    keyBindingFn: sug.keyBindingFn,
    renderModal: sug.renderModal,
    removeModal: sug.removeModal,
    onChange: sug.onChange
  })
  const lnk = useLinks(editorState, setEditorState, {
    onChange: emoji.onChange,
    keyBindingFn: emoji.keyBindingFn,
    handleBeforeInput: md.handleBeforeInput,
    handleKeyCommand: md.handleKeyCommand,
    removeModal: emoji.removeModal,
    renderModal: emoji.renderModal,
    editorRef,
    useTaskChild: () => {
      return
    }
  })

  return {
    handleReturn: sug.handleReturn,
    ...lnk
  }
}

export default useCommentPlugins

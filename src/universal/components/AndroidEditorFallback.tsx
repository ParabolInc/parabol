import React, {Ref, useEffect, useState} from 'react'
import styled from 'react-emotion'
import TextArea from 'react-textarea-autosize'
import {cardContentFontSize, cardContentLineHeight} from 'universal/styles/cards'
import {EditorState} from 'draft-js'

interface Props {
  editorState: EditorState
  onBlur: (e: React.FocusEvent) => void
  onFocus: (e: React.FocusEvent) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  placeholder: string
  setEditorRef: Ref<HTMLTextAreaElement>
  onChange: () => void
}

const TextAreaStyles = styled(TextArea)({
  border: 0,
  fontSize: cardContentFontSize,
  lineHeight: cardContentLineHeight,
  overflow: 'hidden',
  outline: 0,
  padding: 12,
  resize: 'none',
  width: '100%'
})

const AndroidEditorFallback = (props: Props) => {
  const {editorState, onBlur, onFocus, onKeyDown, placeholder, setEditorRef} = props
  const [value, setValue] = useState('')

  useEffect(() => {
    const currentContent = editorState.getCurrentContent()
    const text = currentContent.getPlainText()
    setValue(text)
  }, [editorState])

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
  }

  return (
    <TextAreaStyles
      inputRef={setEditorRef}
      spellCheck
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
    />
  )
}

export default AndroidEditorFallback

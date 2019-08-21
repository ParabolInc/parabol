import React, {Ref} from 'react'
import MentionTag from '../MentionTag/MentionTag'
import MentionUser from '../MentionUser/MentionUser'
import {PALETTE} from '../../styles/paletteV2'
import styled from '@emotion/styled'

const dontTellDraft = (e) => {
  e.preventDefault()
}

const suggestionTypes = {
  tag: MentionTag,
  mention: MentionUser
}

export type TaskSuggestionType = keyof typeof suggestionTypes

const MentionMenu = styled('div')({
  color: PALETTE.TEXT_MAIN
})

interface Props {
  active: number
  handleSelect: (idx: number) => (e: React.MouseEvent) => void
  innerRef: Ref<HTMLDivElement>
  suggestions: object[]
  suggestionType: TaskSuggestionType
}

const EditorSuggestions = (props: Props) => {
  const {active, handleSelect, innerRef, suggestions, suggestionType} = props
  const SuggestionItem = suggestionTypes[suggestionType]
  return (
    <MentionMenu ref={innerRef}>
      {suggestions.map((suggestion, idx) => {
        return (
          // eslint-disable-next-line
          <div key={idx} onMouseDown={dontTellDraft} onClick={handleSelect(idx)}>
            <SuggestionItem active={active === idx} {...suggestion as any} />
          </div>
        )
      })}
    </MentionMenu>
  )
}

export default EditorSuggestions

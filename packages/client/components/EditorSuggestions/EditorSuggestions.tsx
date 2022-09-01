import styled from '@emotion/styled'
import React, {useLayoutEffect} from 'react'
import {MenuPosition} from '../../hooks/useCoords'
import useMenu from '../../hooks/useMenu'
import {PALETTE} from '../../styles/paletteV3'
import {BBox} from '../../types/animations'
import MentionTag from '../MentionTag/MentionTag'
import MentionUser from '../MentionUser/MentionUser'
import {BaseSuggestion} from '../TaskEditor/useSuggestions'

const dontTellDraft = (e) => {
  e.preventDefault()
}

const suggestionTypes = {
  tag: MentionTag,
  mention: MentionUser
}

export type TaskSuggestionType = keyof typeof suggestionTypes

const MentionMenu = styled('div')({
  color: PALETTE.SLATE_700
})

interface Props<T extends BaseSuggestion> {
  active: number
  handleSelect: (item: T) => void
  originCoords: BBox
  suggestions: T[]
  suggestionType: TaskSuggestionType
}

const EditorSuggestions = <T extends BaseSuggestion>(props: Props<T>) => {
  const {active, handleSelect, suggestions, suggestionType, originCoords} = props
  const {menuPortal, openPortal} = useMenu(MenuPosition.UPPER_LEFT, {
    originCoords,
    isDropdown: true
  })
  const SuggestionItem = suggestionTypes[suggestionType]
  useLayoutEffect(openPortal, [])
  return suggestions.length > 0
    ? menuPortal(
        <MentionMenu>
          {suggestions.map((suggestion, idx) => {
            return (
              // eslint-disable-next-line
              <div
                key={idx}
                onMouseDown={dontTellDraft}
                onClick={(e) => {
                  e.preventDefault()
                  handleSelect(suggestion)
                }}
              >
                <SuggestionItem active={active === idx} {...(suggestion as any)} />
              </div>
            )
          })}
        </MentionMenu>
      )
    : null
}

export default EditorSuggestions

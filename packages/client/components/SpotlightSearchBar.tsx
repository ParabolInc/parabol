import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import Icon from './Icon'
import {ElementWidth} from '../types/constEnums'
import Atmosphere from '../Atmosphere'
import {commitLocalUpdate} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import React, {useRef} from 'react'

const SearchItem = styled(MenuItemLabel)({
  overflow: 'visible',
  padding: 0,
  position: 'absolute',
  bottom: -16,
  width: ElementWidth.REFLECTION_CARD
})

const StyledMenuItemIcon = styled(MenuItemComponentAvatar)({
  position: 'absolute',
  left: 8,
  top: 8
})

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24
})

const SearchInput = styled('input')({
  appearance: 'none',
  border: `1px solid ${PALETTE.SKY_500}`,
  borderRadius: 4,
  boxShadow: `0 0 1px 1px ${PALETTE.SKY_300}`,
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: 14,
  lineHeight: '24px',
  outline: 'none',
  padding: '6px 0 6px 39px',
  width: '100%',
  '::placeholder': {
    color: PALETTE.SLATE_600
  }
})

const setSpotlightSearch = (atmosphere: Atmosphere, meetingId: string, value: string | null) => {
  commitLocalUpdate(atmosphere, (store) => {
    const meeting = store.get(meetingId)
    if (!meeting) return
    meeting.setValue(value, 'spotlightSearchQuery')
  })
}

interface Props {
  meetingId: string
  spotlightSearchQuery: string
}

const SpotlightSearchBar = (props: Props) => {
  const {meetingId, spotlightSearchQuery} = props
  const atmosphere = useAtmosphere()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpotlightSearch(atmosphere, meetingId, e.currentTarget.value)
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && inputRef.current) {
      e.stopPropagation()
      e.preventDefault()
      inputRef.current.blur()
    }
  }

  return (
    <SearchItem>
      <StyledMenuItemIcon>
        <SearchIcon>search</SearchIcon>
      </StyledMenuItemIcon>
      <SearchInput
        autoFocus
        autoComplete='off'
        name='search'
        placeholder='Or search for keywords...'
        spellCheck={true}
        type='text'
        onChange={onChange}
        onKeyDown={onKeyDown}
        ref={inputRef}
        value={spotlightSearchQuery ?? ""}
      />
    </SearchItem>
  )
}

export default SpotlightSearchBar
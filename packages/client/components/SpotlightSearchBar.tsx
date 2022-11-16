import styled from '@emotion/styled'
import {Search as SearchIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import SendClientSegmentEventMutation from '~/mutations/SendClientSegmentEventMutation'
import Atmosphere from '../Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '../styles/paletteV3'
import {ElementHeight, ElementWidth} from '../types/constEnums'
import {SpotlightSearchBar_meeting$key} from '../__generated__/SpotlightSearchBar_meeting.graphql'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'

const SearchWrapper = styled('div')({
  width: ElementWidth.REFLECTION_CARD
})

const Search = styled(MenuItemLabel)({
  overflow: 'visible',
  padding: 0,
  position: 'absolute',
  bottom: -ElementHeight.REFLECTION_CARD / 2,
  width: ElementWidth.REFLECTION_CARD
})

const StyledMenuItemIcon = styled(MenuItemComponentAvatar)({
  position: 'absolute',
  left: 8,
  top: 8
})

const StyledSearchIcon = styled(SearchIcon)({
  color: PALETTE.SLATE_600
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
  padding: '6px 0 6px 40px',
  width: '100%',
  '::placeholder': {
    color: PALETTE.SLATE_600
  }
})

const setSpotlightSearch = (atmosphere: Atmosphere, meetingId: string, value: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const meeting = store.get(meetingId)
    if (!meeting) return
    meeting.setValue(value, 'spotlightSearchQuery')
  })
}

interface Props {
  meetingRef: SpotlightSearchBar_meeting$key
}

const SpotlightSearchBar = (props: Props) => {
  const {meetingRef} = props
  const hasSearchedRef = useRef(false)
  const meeting = useFragment(
    graphql`
      fragment SpotlightSearchBar_meeting on RetrospectiveMeeting {
        id
        spotlightSearchQuery
        spotlightReflectionId
      }
    `,
    meetingRef
  )
  const {id: meetingId, spotlightSearchQuery, spotlightReflectionId} = meeting
  const atmosphere = useAtmosphere()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpotlightSearch(atmosphere, meetingId, e.currentTarget.value)
    if (!hasSearchedRef.current) {
      SendClientSegmentEventMutation(atmosphere, 'Searched in Spotlight', {
        reflectionId: spotlightReflectionId,
        meetingId
      })
      hasSearchedRef.current = true
    }
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
    <SearchWrapper>
      <Search>
        <StyledMenuItemIcon>
          <StyledSearchIcon />
        </StyledMenuItemIcon>
        <SearchInput
          onKeyDown={onKeyDown}
          autoFocus
          autoComplete='off'
          name='search'
          placeholder='Or search for keywords...'
          type='text'
          spellCheck={true}
          onChange={onChange}
          ref={inputRef}
          value={spotlightSearchQuery ?? ''}
        />
      </Search>
    </SearchWrapper>
  )
}

export default SpotlightSearchBar

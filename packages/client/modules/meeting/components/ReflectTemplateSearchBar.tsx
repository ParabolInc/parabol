import styled from '@emotion/styled'
import React, {ChangeEvent, useRef} from 'react'
import {commitLocalUpdate} from 'react-relay'
import Atmosphere from '../../../Atmosphere'
import Icon from '../../../components/Icon'
import MenuItemComponentAvatar from '../../../components/MenuItemComponentAvatar'
import MenuItemLabel from '../../../components/MenuItemLabel'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {PALETTE} from '../../../styles/paletteV3'
import {ICON_SIZE} from '../../../styles/typographyV2'

const Search = styled(MenuItemLabel)({
  overflow: 'visible',
  padding: 0,
  display: 'flex',
  position: 'relative'
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
  border: `1px solid ${PALETTE.SKY_500}`,
  boxShadow: `inset 0px 0px 1px ${PALETTE.SKY_500}`,
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

const setTemplateSearch = (atmosphere: Atmosphere, settingsId: string, value: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const settings = store.get(settingsId)
    if (!settings) return
    const normalizedSearch = value.toLowerCase().trim()
    settings.setValue(normalizedSearch, 'templateSearchQuery')
  })
}

interface Props {
  settingsId: string
}

const SpotlightSearchBar = (props: Props) => {
  const {settingsId} = props
  const atmosphere = useAtmosphere()

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTemplateSearch(atmosphere, settingsId, e.currentTarget.value)
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
    <Search>
      <StyledMenuItemIcon>
        <SearchIcon>search</SearchIcon>
      </StyledMenuItemIcon>
      <SearchInput
        onKeyDown={onKeyDown}
        autoComplete='off'
        name='search'
        placeholder='Search templates...'
        type='text'
        onChange={onChange}
        ref={inputRef}
      />
    </Search>
  )
}

export default SpotlightSearchBar

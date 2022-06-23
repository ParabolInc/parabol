import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ChangeEvent, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {ReflectTemplateSearchBar_settings$key} from '~/__generated__/ReflectTemplateSearchBar_settings.graphql'
import Atmosphere from '../../../Atmosphere'
import Icon from '../../../components/Icon'
import MenuItemComponentAvatar from '../../../components/MenuItemComponentAvatar'
import MenuItemLabel from '../../../components/MenuItemLabel'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {PALETTE} from '../../../styles/paletteV3'
import {ICON_SIZE} from '../../../styles/typographyV2'
import {templateIdxs} from './ReflectTemplateList'

const SearchBarWrapper = styled('div')({
  padding: '16px 16px 0 16px'
})

const Search = styled(MenuItemLabel)({
  alignItems: 'center',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: '40px',
  display: 'flex',
  height: 40,
  overflow: 'visible',
  paddingLeft: 20,
  position: 'relative',
  width: '100%'
})

const StyledMenuItemIcon = styled(MenuItemComponentAvatar)({
  position: 'absolute',
  left: 10,
  top: 8
})

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24
})

const ClearSearchIcon = styled(Icon)<{isEmpty: boolean}>(({isEmpty}) => ({
  color: PALETTE.SLATE_500,
  cursor: 'pointer',
  padding: 8,
  display: isEmpty ? 'none' : 'flex'
}))

const InputWrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  paddingLeft: 8
})

const SearchInput = styled('input')({
  appearance: 'none',
  border: 'none',
  color: PALETTE.SLATE_700,
  fontSize: 16,
  margin: 0,
  padding: 12,
  height: 40,
  outline: 0,
  backgroundColor: 'transparent',
  width: '100%'
})

const setTemplateSearch = (atmosphere: Atmosphere, settingsId: string, value: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const settings = store.get(settingsId)
    if (!settings) return
    const normalizedSearch = value.toLowerCase()
    settings.setValue(normalizedSearch, 'templateSearchQuery')
  })
}

interface Props {
  activeIdx: number
  clearSearch: () => void
  settingsRef: ReflectTemplateSearchBar_settings$key
}

const ReflectTemplateSearchBar = (props: Props) => {
  const {activeIdx, clearSearch, settingsRef} = props
  const atmosphere = useAtmosphere()
  const settings = useFragment(
    graphql`
      fragment ReflectTemplateSearchBar_settings on RetrospectiveMeetingSettings {
        id
        templateSearchQuery
      }
    `,
    settingsRef
  )
  const {id: settingsId, templateSearchQuery} = settings
  const templateType = Object.keys(templateIdxs).find((key) => templateIdxs[key] === activeIdx)
  const normalizedTempType = templateType === 'ORGANIZATION' ? 'org' : templateType?.toLowerCase()

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
    <SearchBarWrapper>
      <Search>
        <StyledMenuItemIcon>
          <SearchIcon>search</SearchIcon>
        </StyledMenuItemIcon>
        <InputWrapper>
          <SearchInput
            onKeyDown={onKeyDown}
            autoComplete='off'
            name='search'
            placeholder={`Search ${normalizedTempType} templates...`}
            type='text'
            onChange={onChange}
            ref={inputRef}
            value={templateSearchQuery ?? ''}
          />
        </InputWrapper>
        <ClearSearchIcon isEmpty={!templateSearchQuery} onClick={clearSearch}>
          close
        </ClearSearchIcon>
      </Search>
    </SearchBarWrapper>
  )
}

export default ReflectTemplateSearchBar

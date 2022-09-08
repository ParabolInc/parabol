import styled from '@emotion/styled'
import {Close, Search as SearchIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {ChangeEvent, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {SharingScopeEnum} from '~/__generated__/ReflectTemplateItem_template.graphql'
import {ReflectTemplateSearchBar_settings$key} from '~/__generated__/ReflectTemplateSearchBar_settings.graphql'
import Atmosphere from '../../../Atmosphere'
import MenuItemComponentAvatar from '../../../components/MenuItemComponentAvatar'
import MenuItemLabel from '../../../components/MenuItemLabel'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {PALETTE} from '../../../styles/paletteV3'

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

const StyledSearchIcon = styled(SearchIcon)({
  color: PALETTE.SLATE_600
})

const ClearSearchIcon = styled(Close)<{isEmpty: boolean}>(({isEmpty}) => ({
  color: PALETTE.SLATE_500,
  cursor: 'pointer',
  margin: 8,
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
  templateType: SharingScopeEnum
  clearSearch: () => void
  settingsRef: ReflectTemplateSearchBar_settings$key
}

const ReflectTemplateSearchBar = (props: Props) => {
  const {templateType, clearSearch, settingsRef} = props

  const {t} = useTranslation()

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
  const normalizedTempType = templateType === 'ORGANIZATION' ? 'org' : templateType?.toLowerCase()

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTemplateSearch(atmosphere, settingsId, e.currentTarget.value)
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === t('ReflectTemplateSearchBar.Escape') && inputRef.current) {
      e.stopPropagation()
      e.preventDefault()
      inputRef.current.blur()
    }
  }

  const handleClear = () => {
    inputRef.current?.focus()
    clearSearch()
  }

  return (
    <SearchBarWrapper>
      <Search>
        <StyledMenuItemIcon>
          <StyledSearchIcon />
        </StyledMenuItemIcon>
        <InputWrapper>
          <SearchInput
            onKeyDown={onKeyDown}
            autoComplete='off'
            name='search'
            placeholder={t('ReflectTemplateSearchBar.SearchNormalizedTempTypeTemplates', {
              normalizedTempType
            })}
            type='text'
            onChange={onChange}
            ref={inputRef}
            value={templateSearchQuery ?? ''}
          />
        </InputWrapper>
        <ClearSearchIcon isEmpty={!templateSearchQuery} onClick={handleClear} />
      </Search>
    </SearchBarWrapper>
  )
}

export default ReflectTemplateSearchBar

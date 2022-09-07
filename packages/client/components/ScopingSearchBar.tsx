import styled from '@emotion/styled'
import React, {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {PALETTE} from '../styles/paletteV3'

const SearchBar = styled('div')({
  padding: 16
})

const SearchBarWrapper = styled('div')({
  alignItems: 'center',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: '40px',
  display: 'flex',
  height: 44,
  padding: '0 16px',
  width: '100%'
})

const CurrentFiltersWrapper = styled('div')({
  width: '100%',
  display: 'flex',
  paddingLeft: '72px',
  paddingTop: '8px'
})

const Description = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 16,
  fontWeight: 500,
  whiteSpace: 'nowrap'
})

const Items = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 16,
  fontWeight: 600,
  fontStyle: 'italic',
  padding: '0px 24px 0px 4px',
  width: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
})

interface Props {
  children: ReactNode
  currentFilters?: string
}

const ScopingSearchBar = (props: Props) => {
  const {children, currentFilters} = props

  const {t} = useTranslation()

  return (
    <SearchBar>
      <SearchBarWrapper>{children}</SearchBarWrapper>
      {currentFilters && (
        <CurrentFiltersWrapper>
          <Description>{t('ScopingSearchBar.CurrentFilters')}</Description>
          <Items>{currentFilters}</Items>
        </CurrentFiltersWrapper>
      )}
    </SearchBar>
  )
}

export default ScopingSearchBar

import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from 'styles/paletteV2'
import Icon from './Icon'

interface Props {
  viewer: any
}

const Wrapper = styled('div')({
  alignItems: 'center',
  backgroundColor: 'hsla(0,0%,100%,.125)',
  display: 'flex',
  margin: 12,
  width: 480
})

const SearchInput = styled('input')({
  appearance: 'none',
  border: '1px solid transparent',
  color: PALETTE.TEXT_LIGHT,
  fontSize: 20,
  lineHeight: '24px',
  margin: 0,
  outline: 0,
  padding: '12px 16px',
  backgroundColor: 'transparent',
  width: '100%'
})

const SearchIcon = styled(Icon)({
  color: '#fff',
  cursor: 'pointer',
  padding: 12
})

const TopBarSearch = (props: Props) => {
  const {} = props
  return (
    <Wrapper>
      <SearchInput placeholder={'Search'} />
      <SearchIcon>{'search'}</SearchIcon>
    </Wrapper>
  )
}

export default TopBarSearch

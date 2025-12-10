import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV3'

// Placeholder for filters
const Wrapper = styled('div')({
  display: 'flex',
  gap: 16,
  marginTop: 24,
  marginBottom: 48
})

const FilterButton = styled('button')({
  background: 'transparent',
  border: 'none',
  color: PALETTE.SLATE_400,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  ':hover': {
    color: PALETTE.SLATE_200
  }
})

// TODO: Implement actual filters based on SearchFilter type
const SearchFilters = () => {
  return (
    <Wrapper>
      <FilterButton>Any collection ▾</FilterButton>
      <FilterButton>Any time ▾</FilterButton>
    </Wrapper>
  )
}

export default SearchFilters

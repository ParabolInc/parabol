import styled from '@emotion/styled'
import {Search} from '@mui/icons-material'
import {PALETTE} from '~/styles/paletteV3'

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '64px 0',
  color: PALETTE.SLATE_400,
  gap: 16
})

const Title = styled('h3')({
  fontSize: 20,
  fontWeight: 600,
  color: PALETTE.SLATE_200,
  margin: 0
})

const Description = styled('p')({
  fontSize: 16,
  margin: 0,
  textAlign: 'center'
})

const SearchEmptyState = () => {
  return (
    <Wrapper>
      <Search sx={{fontSize: 64, color: PALETTE.SLATE_600}} />
      <Title>Search Parabol</Title>
      <Description>Find meetings, tasks, and pages across your teams.</Description>
    </Wrapper>
  )
}

export default SearchEmptyState

import styled from '@emotion/styled'
import {cardShadow} from 'universal/styles/elevation'

const ProviderCard = styled('div')({
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: cardShadow,
  display: 'flex',
  justifyContent: 'flex-start',
  margin: '8px 0',
  padding: 16,
  position: 'relative',
  width: '100%'
})

export default ProviderCard

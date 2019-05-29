import styled from 'react-emotion'
import {cardShadow} from 'universal/styles/elevation'

const ProviderCard = styled('div')({
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: cardShadow,
  display: 'flex',
  justifyContent: 'flex-start',
  margin: '8px 0',
  // padding: '16px 24px 16px 16px',
  padding: '16px',
  position: 'relative',
  width: '100%'
})

export default ProviderCard

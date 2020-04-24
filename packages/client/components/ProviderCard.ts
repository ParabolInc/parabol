import styled from '@emotion/styled'
import {cardShadow} from '../styles/elevation'

const ProviderCard = styled('div')({
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: cardShadow,
  display: 'flex',
  flexShrink: 0,
  justifyContent: 'flex-start',
  margin: '16px 0',
  padding: 16,
  position: 'relative',
  width: '100%'
})

export default ProviderCard

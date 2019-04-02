import styled from 'react-emotion'
import {cardShadow} from 'universal/styles/elevation'

const BasicCard = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  background: 'white',
  borderRadius: '4px',
  boxShadow: cardShadow
})

export default BasicCard

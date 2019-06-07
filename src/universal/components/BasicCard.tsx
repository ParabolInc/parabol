import styled from 'react-emotion'
import {cardShadow, modalShadow} from 'universal/styles/elevation'

const BasicCard = styled('div')({
  background: 'white',
  borderRadius: 8,
  boxShadow: modalShadow,
  display: 'flex',
  flexDirection: 'column'
})

export default BasicCard

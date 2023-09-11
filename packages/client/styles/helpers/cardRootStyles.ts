import {Card} from '../../types/constEnums'
import {cardShadow} from '../elevation'

const cardRootStyles = {
  backgroundColor: '#FFFFFF',
  border: 0,
  borderRadius: Card.BORDER_RADIUS,
  boxShadow: cardShadow,
  minWidth: 256,
  maxWidth: 296,
  position: 'relative' as const,
  width: '100%'
}

export default cardRootStyles

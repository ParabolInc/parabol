import styled from 'react-emotion'
import {PALETTE} from 'universal/styles/paletteV2'
import {Layout} from 'universal/types/constEnums'

const NotificationMessage = styled('div')({
  color: PALETTE.TEXT.MAIN,
  flex: 1,
  fontSize: 14,
  lineHeight: '20px',
  marginLeft: Layout.ROW_GUTTER
})

export default NotificationMessage

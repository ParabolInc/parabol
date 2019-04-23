import styled from 'react-emotion'
import ui from 'universal/styles/ui'

const NotificationMessage = styled('div')({
  color: ui.colorText,
  flex: 1,
  fontSize: 14,
  lineHeight: '20px',
  marginLeft: 16 // #gutter
})

export default NotificationMessage

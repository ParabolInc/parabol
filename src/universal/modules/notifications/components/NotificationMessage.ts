import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'

const NotificationMessage = styled('div')({
  color: ui.colorText,
  flex: 1,
  fontSize: appTheme.typography.s3,
  lineHeight: '1.375rem',
  marginLeft: ui.rowCompactGutter
})

export default NotificationMessage

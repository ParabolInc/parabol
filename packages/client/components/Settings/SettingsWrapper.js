import styled from '@emotion/styled'
import ui from '../../styles/ui'

const SettingsWrapper = styled('div')(({narrow}) => ({
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: narrow ? 644 : 768,
  width: '100%'
}))

export default SettingsWrapper

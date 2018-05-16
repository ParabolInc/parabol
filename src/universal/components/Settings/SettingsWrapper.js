import styled from 'react-emotion'
import ui from 'universal/styles/ui'

const SettingsWrapper = styled('div')(({narrow}) => ({
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: narrow ? ui.settingsPanelMaxWidthNarrow : ui.settingsPanelMaxWidth,
  width: '100%'
}))

export default SettingsWrapper

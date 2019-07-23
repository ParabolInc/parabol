import ui from 'universal/styles/ui'
import styled from '@emotion/styled'

const DashSectionHeader = styled('div')({
  alignItems: 'flex-end',
  display: 'flex',
  margin: '0 auto',
  maxWidth: ui.taskColumnsMaxWidth,
  padding: `1rem ${ui.dashGutterSmall}`,
  position: 'relative',
  width: '100%',

  [ui.dashBreakpoint]: {
    padding: `2rem ${ui.dashGutterLarge} 2.25rem`
  }
})

export default DashSectionHeader

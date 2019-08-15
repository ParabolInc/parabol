import ui from '../../styles/ui'
import styled from '@emotion/styled'

const DashContent = styled('div')<{hasOverlay?: boolean}>(({hasOverlay}) => ({
  backgroundColor: ui.dashBackgroundColor,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  // overflow: 'auto', removed because react-beautiful-dnd only supports 1 scrolling parent
  width: '100%',
  height: '100%',
  filter: hasOverlay ? ui.filterBlur : undefined
}))

export default DashContent

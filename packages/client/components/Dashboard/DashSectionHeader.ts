import styled from '@emotion/styled'
import {Gutters, Layout} from '../../types/constEnums'

const DashSectionHeader = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  margin: '0',
  maxWidth: Layout.TASK_COLUMNS_MAX_WIDTH,
  padding: `16px ${Gutters.DASH_GUTTER} 4px`,
  position: 'relative',
  width: '100%'
})

export default DashSectionHeader

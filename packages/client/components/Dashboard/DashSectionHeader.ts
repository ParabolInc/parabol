import styled from '@emotion/styled'
import {Breakpoint, Gutters, Layout} from '../../types/constEnums'

const DashSectionHeader = styled('div')({
  alignItems: 'flex-end',
  display: 'flex',
  margin: '0 auto',
  maxWidth: Layout.TASK_COLUMNS_MAX_WIDTH,
  padding: `16px ${Gutters.DASH_GUTTER_SMALL}`,
  position: 'relative',
  width: '100%',

  [`@media (min-width: ${Breakpoint.DASHBOARD_WIDE})`]: {
    padding: `32px ${Gutters.DASH_GUTTER_LARGE} 36px`
  }
})

export default DashSectionHeader

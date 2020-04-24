import styled from '@emotion/styled'
import {Breakpoint, Layout} from '../types/constEnums'

const ProviderActions = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-end',
  marginLeft: 'auto',
  paddingLeft: 8,
  maxWidth: 36,
  width: 36,
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    paddingLeft: Layout.ROW_GUTTER,
    maxWidth: 160,
    width: 'auto'
  }
})

export default ProviderActions

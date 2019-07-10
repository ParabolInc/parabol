import styled from 'react-emotion'
import {Layout} from 'universal/types/constEnums'
import {DASH_SIDEBAR} from 'universal/components/Dashboard/DashSidebar'

const ProviderActions = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-end',
  marginLeft: 'auto',
  paddingLeft: 8,
  maxWidth: 36,
  width: 36,
  [`@media screen and (min-width: ${DASH_SIDEBAR.BREAKPOINT}px)`]: {
    paddingLeft: Layout.ROW_GUTTER,
    maxWidth: '10rem',
    width: 'auto'
  }
})

export default ProviderActions

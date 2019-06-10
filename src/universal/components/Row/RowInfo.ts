import styled from 'react-emotion'
import {Layout} from 'universal/types/constEnums'

const RowInfo = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  paddingLeft: Layout.ROW_GUTTER
})

export default RowInfo

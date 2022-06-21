import styled from '@emotion/styled'
import {Layout} from '../../types/constEnums'

const RowInfo = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  paddingLeft: Layout.ROW_GUTTER,
  paddingRight: Layout.ROW_GUTTER
})

export default RowInfo

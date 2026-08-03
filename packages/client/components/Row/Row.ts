import styled from '@emotion/styled'
import {Layout} from '../../types/constEnums'

const Row = styled('div')({
  alignItems: 'center',
  borderTop: `1px solid var(--color-hairline)`,
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  padding: Layout.ROW_GUTTER,
  width: '100%'
})

export default Row

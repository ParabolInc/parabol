import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'

const ThreadEmptyMessage = styled('div')({
  border: `1px dashed ${PALETTE.BORDER_GRAY}`,
  borderRadius: 4,
  color: PALETTE.TEXT_GRAY,
  fontSize: 14,
  fontStyle: 'italic',
  lineHeight: '20px',
  margin: 'auto',
  padding: 8
})

export default ThreadEmptyMessage

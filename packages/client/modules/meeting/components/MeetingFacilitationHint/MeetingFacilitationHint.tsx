import styled from '@emotion/styled'
import type {ReactNode} from 'react'
import Ellipsis from '../../../../components/Ellipsis/Ellipsis'

const Hint = styled('div')({
  color: 'var(--color-fg-secondary)',
  display: 'inline-block',
  fontSize: 13,
  lineHeight: '20px',
  textAlign: 'center'
})

interface Props {
  children: ReactNode
}

const MeetingFacilitationHint = (props: Props) => {
  const {children} = props
  return (
    <Hint>
      {'('}
      {children}
      <Ellipsis />
      {')'}
    </Hint>
  )
}

export default MeetingFacilitationHint

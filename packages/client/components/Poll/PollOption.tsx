import React, {Ref} from 'react'
import styled from '@emotion/styled'
import {usePollContext} from './PollContext'
import {PALETTE} from '~/styles/paletteV3'
import PollOptionInput from './PollOptionInput'

interface Props {
  id: string
  title: string
  placeholder: string | null
}

const PollOptionRoot = styled('div')({
  width: '100%'
})

const PollOptionTitle = styled('div')({
  width: '100%',
  height: '36px',
  fontSize: '14px',
  padding: `0 12px`,
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: '18px',
  display: 'flex',
  alignItems: 'center'
})

const PollOption = React.forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {id, title, placeholder} = props
  const {onPollOptionSelected, pollState} = usePollContext()

  const renderPollOption = () => {
    if (pollState === 'creating') {
      return <PollOptionInput id={id} placeholder={placeholder} value={title} />
    }

    return <PollOptionTitle onClick={() => onPollOptionSelected(id)}>{title}</PollOptionTitle>
  }

  return <PollOptionRoot ref={ref}>{renderPollOption()}</PollOptionRoot>
})

export default PollOption

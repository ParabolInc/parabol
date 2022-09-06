import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {PALETTE} from '~/styles/paletteV3'
import PlainButton from './PlainButton/PlainButton'

const Reply = styled(PlainButton)({
  fontWeight: 600,
  lineHeight: '24px',
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  }
})

interface Props {
  onReply: () => void
  dataCy: string
}

const ThreadedReplyButton = (props: Props) => {
  const {onReply, dataCy} = props

  const {t} = useTranslation()

  return (
    <Reply data-cy={`${dataCy}-reply-button`} onClick={onReply}>
      {t('ThreadedReplyButton.Reply')}
    </Reply>
  )
}

export default ThreadedReplyButton

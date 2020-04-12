import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import CopyLink from '../../../../components/CopyLink'
import Icon from '../../../../components/Icon'
import {PALETTE} from '../../../../styles/paletteV2'

const CopyIcon = styled(Icon)({
  color: 'inherit',
  display: 'block',
  marginRight: 12
})

const CopyLabel = styled('div')({
  color: 'inherit',
  fontSize: 'inherit',
  whiteSpace: 'nowrap'
})

const CopyBlock = styled('div')({
  alignItems: 'center',
  color: PALETTE.TEXT_GRAY,
  display: 'flex',
  flexShrink: 0,
  fontSize: 'inherit',
  minWidth: 0,
  userSelect: 'none',
  overflow: 'auto',
  '&:hover': {
    color: PALETTE.TEXT_MAIN,
    cursor: 'pointer'
  }
})

interface Props {
  className?: string
  icon?: string
  label?: ReactNode
  title?: string | undefined
  tooltip?: string | undefined
  url: string
}
const CopyShortLink = (props: Props) => {
  const {className, icon, label, url, title, tooltip} = props
  const theLabel = label || url
  return (
    <CopyLink url={url} title={title} tooltip={tooltip}>
      <CopyBlock className={className}>
        {icon && <CopyIcon>{icon}</CopyIcon>}
        <CopyLabel>{theLabel}</CopyLabel>
      </CopyBlock>
    </CopyLink>
  )
}

export default CopyShortLink

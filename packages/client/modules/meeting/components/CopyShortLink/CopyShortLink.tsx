import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import CopyLink from '../../../../components/CopyLink'
import Icon from '../../../../components/Icon'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {PALETTE} from '../../../../styles/paletteV2'

const CopyIcon = styled(Icon)({
  color: 'inherit',
  display: 'block',
  fontSize: ICON_SIZE.MD18,
  marginTop: '-.5625rem',
  marginRight: '.5rem',
  position: 'absolute',
  top: '50%',
  right: '100%'
})

const CopyLabel = styled('div')({
  color: 'inherit',
  fontSize: 'inherit'
})

const CopyBlock = styled('div')({
  fontSize: 13,
  color: PALETTE.TEXT_GRAY,
  position: 'relative',
  '&:hover': {
    color: PALETTE.TEXT_MAIN,
    cursor: 'pointer'
  },
  userSelect: 'none'
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

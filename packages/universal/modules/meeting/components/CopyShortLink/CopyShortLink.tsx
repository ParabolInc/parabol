import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import CopyLink from '../../../../components/CopyLink'
import Icon from '../../../../components/Icon'
import {MD_ICONS_SIZE_18} from '../../../../styles/icons'
import {PALETTE} from '../../../../styles/paletteV2'

const CopyIcon = styled(Icon)({
  color: 'inherit',
  display: 'block',
  fontSize: MD_ICONS_SIZE_18,
  marginTop: '-.5625rem',
  marginRight: '.5rem',
  position: 'absolute',
  top: '50%',
  right: '100%'
})

const CopyLabel = styled('div')({
  color: 'inherit',
  fontSize: 13
})

const CopyBlock = styled('div')({
  color: PALETTE.TEXT_LIGHT,
  position: 'relative',
  '&:hover': {
    color: PALETTE.TEXT_MAIN,
    cursor: 'pointer'
  },
  userSelect: 'none'
})

interface Props {
  icon?: string
  label?: ReactNode
  title?: string | undefined
  tooltip?: string | undefined
  url: string
}
const CopyShortLink = (props: Props) => {
  const {icon, label, url, title, tooltip} = props
  const theIcon = icon || 'link'
  const theLabel = label || url
  return (
    <CopyLink url={url} title={title} tooltip={tooltip}>
      <CopyBlock>
        <CopyIcon>{theIcon}</CopyIcon>
        <CopyLabel>{theLabel}</CopyLabel>
      </CopyBlock>
    </CopyLink>
  )
}

export default CopyShortLink

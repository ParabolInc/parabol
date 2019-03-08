import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import CopyLink from 'universal/components/CopyLink'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

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
  fontSize: appTheme.typography.s2
})

const CopyBlock = styled('div')({
  color: ui.hintColor,
  position: 'relative',
  '&:hover': {
    color: ui.colorText,
    cursor: 'pointer'
  }
})

const CopyShortLink = (props) => {
  const {icon, label, url} = props
  const theIcon = icon || 'link'
  const theLabel = label || url
  const title = 'Copy Meeting Link'
  const tooltip = 'Copied the meeting link!'
  return (
    <CopyLink url={url} title={title} tooltip={tooltip}>
      <CopyBlock>
        <CopyIcon>{theIcon}</CopyIcon>
        <CopyLabel>{theLabel}</CopyLabel>
      </CopyBlock>
    </CopyLink>
  )
}

CopyShortLink.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  url: PropTypes.string
}

export default CopyShortLink

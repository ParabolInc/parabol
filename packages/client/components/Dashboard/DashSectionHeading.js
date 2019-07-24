import PropTypes from 'prop-types'
import React from 'react'
import ui from '../../styles/ui'
import Type from '../Type/Type'
import styled from '@emotion/styled'
import Icon from '../Icon'
import {MD_ICONS_SIZE_18} from '../../styles/icons'

const RootBlock = styled('div')(({margin}) => ({
  alignItems: 'center',
  display: 'flex',
  margin: margin || 0,
  whiteSpace: 'nowrap'
}))

const StyledIcon = styled(Icon)({
  color: ui.colorText,
  fontSize: MD_ICONS_SIZE_18,
  marginRight: '.5rem'
})

const DashSectionHeading = (props) => {
  const {icon, label, margin} = props
  return (
    <RootBlock margin={margin}>
      {icon && <StyledIcon>{icon}</StyledIcon>}
      <Type lineHeight='2rem' scale='s4' colorPalette='dark'>
        {label}
      </Type>
    </RootBlock>
  )
}

DashSectionHeading.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  margin: PropTypes.string
}

export default DashSectionHeading

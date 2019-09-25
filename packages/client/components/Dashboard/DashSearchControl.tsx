import PropTypes from 'prop-types'
import React from 'react'
import makePlaceholderStyles from '../../styles/helpers/makePlaceholderStyles'
import {PALETTE} from '../../styles/paletteV2'
import styled from '@emotion/styled'
import Icon from '../Icon'
import {ICON_SIZE} from '../../styles/typographyV2'

const DashSearch = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1
})

const DashSearchIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18,
  marginRight: 8
})

const DashSearchInput = styled('input')({
  appearance: 'none',
  display: 'block',
  border: 0,
  fontSize: 14,
  lineHeight: '32px',
  maxWidth: 208,
  outline: 'none',
  padding: 0,
  width: 'fit-content',
  '&:focus,:active': {
    ...makePlaceholderStyles(PALETTE.PLACEHOLDER_FOCUS_ACTIVE)
  }
})

const DashSearchControl = (props) => {
  const {onChange, placeholder} = props
  return (
    <DashSearch>
      <DashSearchIcon>search</DashSearchIcon>
      <DashSearchInput onChange={onChange} placeholder={placeholder} />
    </DashSearch>
  )
}

DashSearchControl.propTypes = {
  onChange: PropTypes.func,
  placeholder: PropTypes.string
}

export default DashSearchControl

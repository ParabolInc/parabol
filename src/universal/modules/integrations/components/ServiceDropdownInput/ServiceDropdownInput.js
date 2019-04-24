import PropTypes from 'prop-types'
import React from 'react'
import FieldBlock from 'universal/components/FieldBlock/FieldBlock'
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette'
import ui from 'universal/styles/ui'
import LoadableServiceDropdown from 'universal/components/LoadableServiceDropdown'
import styled from 'react-emotion'
import LoadableDropdownMenu from 'universal/components/LoadableDropdownMenu'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'left'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'left'
}

const DownButtonIcon = styled(Icon)({
  cursor: 'pointer',
  paddingRight: '1rem',
  lineHeight: '2rem',
  left: '-1px',
  right: '-1px',
  height: '100%',
  position: 'absolute',
  textAlign: 'right',
  top: 0,
  width: '100%',
  fontSize: MD_ICONS_SIZE_18
})

const DropdownBlock = styled('div')({
  width: '100%'
})

const InputBlock = styled('div')({
  ...ui.fieldBaseStyles,
  ...ui.fieldSizeStyles.small,
  ...makeFieldColorPalette('white'),
  position: 'relative',
  userSelect: 'none'
})

const ServiceDropdownInput = (props) => {
  const {isLoaded, fetchOptions, dropdownText, handleItemClick, options} = props
  return (
    <DropdownBlock>
      <FieldBlock>
        <InputBlock tabIndex='1'>
          <span>{dropdownText}</span>
          <LoadableDropdownMenu
            LoadableComponent={LoadableServiceDropdown}
            maxHeight={350}
            originAnchor={originAnchor}
            queryVars={{
              handleItemClick,
              isLoaded,
              options
            }}
            targetAnchor={targetAnchor}
            toggle={<DownButtonIcon onClick={fetchOptions}>expand_more</DownButtonIcon>}
          />
        </InputBlock>
      </FieldBlock>
    </DropdownBlock>
  )
}

ServiceDropdownInput.propTypes = {
  isLoaded: PropTypes.bool,
  fetchOptions: PropTypes.func.isRequired,
  dropdownText: PropTypes.string.isRequired,
  handleItemClick: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  styles: PropTypes.object
}

export default ServiceDropdownInput

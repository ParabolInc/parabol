import PropTypes from 'prop-types'
import React from 'react'
import FontAwesome from 'react-fontawesome'
import FieldBlock from 'universal/components/FieldBlock/FieldBlock'
import FieldLabel from 'universal/components/FieldLabel/FieldLabel'
import TagPro from 'universal/components/Tag/TagPro'
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette'
import ui from 'universal/styles/ui'
import {PRO} from 'universal/utils/constants'
import LoadableMenu from 'universal/components/LoadableMenu'
import LoadableNewTeamOrgDropdown from 'universal/components/LoadableNewTeamOrgDropdown'
import styled from 'react-emotion'

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
}

const DownButtonIcon = styled(FontAwesome)({
  cursor: 'pointer',
  height: '100%',
  padding: 0,
  paddingRight: ui.controlBlockPaddingHorizontal.medium,
  position: 'absolute',
  right: 0,
  textAlign: 'right',
  top: 0,
  width: '100%',
  fontSize: ui.iconSize,
  lineHeight: '2.375rem'
})

const FieldInput = styled('div')(
  {
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles.medium,
    ...makeFieldColorPalette('white', false),
    position: 'relative',
    paddingRight: 0
  },
  ({disabled}) => (disabled ? ui.fieldDisabled : makeFieldColorPalette('white', true))
)

const DropdownInput = (props) => {
  const {
    disabled,
    fieldSize,
    input: {name, onChange, value},
    label,
    organizations = []
  } = props
  const org = organizations.find((anOrg) => anOrg.id === value)
  const orgName = (org && org.name) || 'Loading...'
  return (
    <FieldBlock>
      {label && <FieldLabel fieldSize={fieldSize} label={label} htmlFor={name} indent />}
      <FieldInput disabled={disabled} tabIndex='1'>
        <span>{orgName}</span>
        {org.tier === PRO && <TagPro />}
        {!disabled && (
          <LoadableMenu
            LoadableComponent={LoadableNewTeamOrgDropdown}
            maxWidth={256}
            minWidth={256}
            maxHeight={350}
            originAnchor={originAnchor}
            queryVars={{
              onChange,
              organizations
            }}
            targetAnchor={targetAnchor}
            toggle={<DownButtonIcon name='chevron-down' />}
          />
        )}
      </FieldInput>
    </FieldBlock>
  )
}

DropdownInput.propTypes = {
  disabled: PropTypes.bool,
  fieldSize: PropTypes.oneOf(ui.fieldSizeOptions),
  input: PropTypes.shape({
    name: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.string
  }),
  label: PropTypes.string,
  organizations: PropTypes.array
}

export default DropdownInput

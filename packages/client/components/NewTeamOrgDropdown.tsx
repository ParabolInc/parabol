import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import {NewTeamOrgDropdown_organizations} from '../__generated__/NewTeamOrgDropdown_organizations.graphql'
import DropdownMenuItemLabel from './DropdownMenuItemLabel'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import TierTag from './Tag/TierTag'

interface Props {
  menuProps: MenuProps
  defaultActiveIdx: number
  onChange: (orgId: string) => void
  organizations: NewTeamOrgDropdown_organizations
}

const NewTeamOrgDropdown = (props: Props) => {
  const {defaultActiveIdx, onChange, organizations, menuProps} = props

  const {t} = useTranslation()

  return (
    <Menu
      ariaLabel={t('NewTeamOrgDropdown.SelectTheOrganizationTheNewTeamBelongsTo')}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx + 1}
    >
      <DropdownMenuLabel>{t('NewTeamOrgDropdown.SelectOrganization:')}</DropdownMenuLabel>
      {organizations.map((anOrg) => {
        const {id, tier, name} = anOrg
        return (
          <MenuItem
            key={id}
            label={
              <DropdownMenuItemLabel>
                <span>{name}</span>
                {tier !== 'personal' && <TierTag tier={tier} />}
              </DropdownMenuItemLabel>
            }
            onClick={() => {
              onChange(id)
            }}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(NewTeamOrgDropdown, {
  organizations: graphql`
    fragment NewTeamOrgDropdown_organizations on Organization @relay(plural: true) {
      id
      name
      tier
    }
  `
})

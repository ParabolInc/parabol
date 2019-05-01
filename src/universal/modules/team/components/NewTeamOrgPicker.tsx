import {NewTeamOrgPicker_organizations} from '__generated__/NewTeamOrgPicker_organizations.graphql'
import React, {useEffect, useMemo} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import DropdownMenuToggle from 'universal/components/DropdownMenuToggle'
import TagPro from 'universal/components/Tag/TagPro'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import {PRO} from 'universal/utils/constants'
import lazyPreload from 'universal/utils/lazyPreload'

interface Props {
  disabled: boolean
  onChange: (orgId) => void
  orgId: string
  organizations: NewTeamOrgPicker_organizations
}

const NO_ORGS = 'No organizations available'

const NewTeamOrgDropdown = lazyPreload(() =>
  import(/* webpackChunkName: 'NewTeamOrgDropdown' */
  'universal/components/NewTeamOrgDropdown')
)

const NewTeamOrgPicker = (props: Props) => {
  const {disabled, onChange, organizations, orgId} = props
  const sortedOrgs = useMemo(() => {
    const orgs = organizations.slice()
    const tierVal = (org) => (org.tier === PRO ? -1 : 1)
    orgs.sort((a, b) =>
      tierVal(a) < tierVal(b)
        ? -1
        : tierVal(a) > tierVal(b)
        ? 1
        : a.name.toLowerCase() < b.name.toLowerCase()
        ? -1
        : 1
    )
    return orgs
  }, [organizations])
  useEffect(() => {
    const [firstOrg] = sortedOrgs
    if (firstOrg) {
      onChange(firstOrg.id)
    }
  }, [])
  const orgIdx = orgId ? sortedOrgs.findIndex((org) => org.id === orgId) : 0
  const org = sortedOrgs[orgIdx]
  const defaultText = org ? org.name : NO_ORGS
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  return (
    <>
      <DropdownMenuToggle
        onMouseEnter={NewTeamOrgDropdown.preload}
        onClick={togglePortal}
        ref={originRef}
        disabled={disabled || defaultText === NO_ORGS}
        defaultText={
          <>
            <span>{defaultText}</span>
            {org && org.tier === PRO && <TagPro />}
          </>
        }
      />
      {menuPortal(
        <NewTeamOrgDropdown
          menuProps={menuProps}
          onChange={onChange}
          organizations={sortedOrgs}
          defaultActiveIdx={orgIdx}
        />
      )}
    </>
  )
}

export default createFragmentContainer(
  NewTeamOrgPicker,
  graphql`
    fragment NewTeamOrgPicker_organizations on Organization @relay(plural: true) {
      ...NewTeamOrgDropdown_organizations
      id
      name
      tier
    }
  `
)

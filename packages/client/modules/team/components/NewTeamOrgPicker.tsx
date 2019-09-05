import {NewTeamOrgPicker_organizations} from '../../../__generated__/NewTeamOrgPicker_organizations.graphql'
import React, {useEffect, useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import DropdownMenuToggle from '../../../components/DropdownMenuToggle'
import TagPro from '../../../components/Tag/TagPro'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import {PRO} from '../../../utils/constants'
import lazyPreload from '../../../utils/lazyPreload'
import styled from '@emotion/styled'

const MenuToggleInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  minWidth: 0
})

const MenuToggleLabel = styled('div')({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

interface Props {
  disabled: boolean
  onChange: (orgId) => void
  orgId: string
  organizations: NewTeamOrgPicker_organizations
}

const NO_ORGS = 'No organizations available'

const NewTeamOrgDropdown = lazyPreload(() =>
  import(/* webpackChunkName: 'NewTeamOrgDropdown' */
  '../../../components/NewTeamOrgDropdown')
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
  }, [/* eslint-disable-line react-hooks/exhaustive-deps*/])
  const orgIdx = orgId ? sortedOrgs.findIndex((org) => org.id === orgId) : 0
  const org = sortedOrgs[orgIdx]
  const defaultText = org ? org.name : NO_ORGS
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(MenuPosition.UPPER_RIGHT, {
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
          <MenuToggleInner>
            <MenuToggleLabel>{defaultText}</MenuToggleLabel>
            {org && org.tier === PRO && <TagPro />}
          </MenuToggleInner>
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

export default createFragmentContainer(NewTeamOrgPicker, {
  organizations: graphql`
    fragment NewTeamOrgPicker_organizations on Organization @relay(plural: true) {
      ...NewTeamOrgDropdown_organizations
      id
      name
      tier
    }
  `
})

import graphql from 'babel-plugin-relay/macro'
import {Suspense, useEffect, useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {NewTeamOrgPicker_organizations$key} from '../../../__generated__/NewTeamOrgPicker_organizations.graphql'
import DropdownMenuToggle from '../../../components/DropdownMenuToggle'
import TierTag from '../../../components/Tag/TierTag'
import {Select} from '../../../ui/Select/Select'
import {SelectTrigger} from '../../../ui/Select/SelectTrigger'
import lazyPreload from '../../../utils/lazyPreload'
import sortByTier from '../../../utils/sortByTier'

interface Props {
  disabled: boolean
  onChange: (orgId: string) => void
  orgId: string
  organizations: NewTeamOrgPicker_organizations$key
}

const NO_ORGS = 'No organizations available'

const NewTeamOrgDropdown = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'NewTeamOrgDropdown' */
      '../../../components/NewTeamOrgDropdown'
    )
)

const NewTeamOrgPicker = (props: Props) => {
  const {disabled, onChange, organizations: organizationsRef, orgId} = props
  const organizations = useFragment(
    graphql`
      fragment NewTeamOrgPicker_organizations on Organization @relay(plural: true) {
        ...NewTeamOrgDropdown_organizations
        id
        name
        tier
        billingTier
      }
    `,
    organizationsRef
  )
  const sortedOrgs = useMemo(() => sortByTier(organizations), [organizations])
  useEffect(() => {
    if (orgId) return
    const [firstOrg] = sortedOrgs
    if (firstOrg) {
      onChange(firstOrg.id)
    }
  }, [])
  const orgIdx = orgId ? sortedOrgs.findIndex((org) => org.id === orgId) : 0
  const org = sortedOrgs[orgIdx]
  const defaultText = org ? org.name : NO_ORGS
  const isDisabled = disabled || defaultText === NO_ORGS
  const toggle = (
    <DropdownMenuToggle
      onMouseEnter={NewTeamOrgDropdown.preload}
      disabled={isDisabled}
      defaultText={
        <div className='flex min-w-0 flex-wrap items-center'>
          <div className='flex-1 overflow-hidden text-ellipsis whitespace-nowrap'>
            {defaultText}
          </div>
          {org && org.tier !== 'starter' && (
            <TierTag tier={org.tier} billingTier={org.billingTier} />
          )}
        </div>
      }
    />
  )

  if (isDisabled) return toggle

  return (
    <Select value={org?.id} onValueChange={onChange}>
      <SelectTrigger asChild>{toggle}</SelectTrigger>
      <Suspense fallback={null}>
        <NewTeamOrgDropdown organizations={sortedOrgs} />
      </Suspense>
    </Select>
  )
}

export default NewTeamOrgPicker

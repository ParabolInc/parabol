import {NewTeamOrgPicker_organizations} from '__generated__/NewTeamOrgPicker_organizations.graphql'
import memoize from 'micro-memoize'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import LoadableDropdownMenuToggle from 'universal/components/LoadableDropdownMenuToggle'
import LoadableNewTeamOrgDropdown from 'universal/components/LoadableNewTeamOrgDropdown'
import TagPro from 'universal/components/Tag/TagPro'
import {PRO} from 'universal/utils/constants'

interface Props {
  disabled: boolean
  onChange: (orgId) => void
  orgId: string
  organizations: NewTeamOrgPicker_organizations
}

const NO_ORGS = 'No organizations available'

class NewTeamOrgPicker extends Component<Props> {
  constructor (props) {
    super(props)
    const sortedOrgs = this.sortOrgs(props.organizations)
    const [firstOrg] = sortedOrgs
    if (firstOrg) {
      props.onChange(firstOrg.id)
    }
  }

  sortOrgs = memoize((organizations: NewTeamOrgPicker_organizations) => {
    const orgs = organizations.slice()
    const tierVal = (org) => (org.tier === PRO ? -1 : 1)
    orgs.sort(
      (a, b) =>
        tierVal(a) < tierVal(b)
          ? -1
          : tierVal(a) > tierVal(b)
            ? 1
            : a.name.toLowerCase() < b.name.toLowerCase()
              ? -1
              : 1
    )
    return orgs
  })

  render () {
    const {disabled, onChange, organizations, orgId} = this.props
    const sortedOrgs = this.sortOrgs(organizations)
    const orgIdx = orgId ? sortedOrgs.findIndex((org) => org.id === orgId) : 0
    const org = sortedOrgs[orgIdx]
    const defaultText = org ? org.name : NO_ORGS
    return (
      <LoadableDropdownMenuToggle
        disabled={disabled || defaultText === NO_ORGS}
        defaultText={
          <React.Fragment>
            <span>{defaultText}</span>
            {org && org.tier === PRO && <TagPro />}
          </React.Fragment>
        }
        LoadableComponent={LoadableNewTeamOrgDropdown}
        queryVars={{
          onChange,
          organizations: sortedOrgs,
          defaultActiveIdx: orgIdx
        }}
      />
    )
  }
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

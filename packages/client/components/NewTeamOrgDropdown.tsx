import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewTeamOrgDropdown_organizations$key} from '../__generated__/NewTeamOrgDropdown_organizations.graphql'
import {SelectContent} from '../ui/Select/SelectContent'
import {SelectItem} from '../ui/Select/SelectItem'
import DropdownMenuLabel from './DropdownMenuLabel'
import TierTag from './Tag/TierTag'

interface Props {
  organizations: NewTeamOrgDropdown_organizations$key
}

const NewTeamOrgDropdown = (props: Props) => {
  const {organizations: organizationsRef} = props
  const organizations = useFragment(
    graphql`
      fragment NewTeamOrgDropdown_organizations on Organization @relay(plural: true) {
        id
        name
        tier
        billingTier
      }
    `,
    organizationsRef
  )
  return (
    <SelectContent align='start' className='max-h-56 overflow-y-auto'>
      <DropdownMenuLabel>Select Organization:</DropdownMenuLabel>
      {organizations.map((anOrg) => {
        const {id, tier, billingTier, name} = anOrg
        return (
          <SelectItem key={id} value={id} textValue={name}>
            <span className='flex items-center'>
              <span>{name}</span>
              {tier !== 'starter' && <TierTag tier={tier} billingTier={billingTier} />}
            </span>
          </SelectItem>
        )
      })}
    </SelectContent>
  )
}

export default NewTeamOrgDropdown

import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ConnectedAppAccess_grant$key} from '../../../__generated__/ConnectedAppAccess_grant.graphql'

const MAX_LISTED_NAMES = 3

const listNames = (names: string[]) => {
  const unlistedCount = names.length - MAX_LISTED_NAMES
  const listed = names.slice(0, MAX_LISTED_NAMES).join(', ')
  return unlistedCount > 0 ? `${listed} +${unlistedCount} more` : listed
}

interface Props {
  grantRef: ConnectedAppAccess_grant$key
}

const ConnectedAppAccess = ({grantRef}: Props) => {
  const {grantedOrgs, grantedTeams, grantedPages} = useFragment(
    graphql`
      fragment ConnectedAppAccess_grant on OAuthAPIGrant {
        grantedOrgs {
          name
        }
        grantedTeams {
          name
        }
        grantedPages {
          title
        }
      }
    `,
    grantRef
  )
  if (!grantedOrgs && !grantedTeams && !grantedPages) return 'Everything'
  const reach: {label: string; names: string}[] = []
  if (!grantedOrgs) {
    reach.push({label: 'Orgs and teams', names: 'All'})
  } else {
    if (grantedOrgs.length > 0) {
      reach.push({label: 'Orgs', names: listNames(grantedOrgs.map(({name}) => name))})
    }
    if (!grantedTeams) {
      reach.push({label: 'Teams', names: 'All'})
    } else if (grantedTeams.length > 0) {
      reach.push({label: 'Teams', names: listNames(grantedTeams.map(({name}) => name))})
    }
  }
  if (grantedPages && grantedPages.length > 0) {
    const titles = grantedPages.map(({title}) => title || '<Untitled>')
    reach.push({label: 'Pages', names: listNames(titles)})
  }
  if (reach.length === 0) return 'Nothing'
  return (
    <ul className='m-0 flex list-none flex-col gap-1 p-0'>
      {reach.map(({label, names}) => (
        <li key={label}>
          <span className='text-fg-muted'>{label}:</span> {names}
        </li>
      ))}
    </ul>
  )
}

export default ConnectedAppAccess

import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ConnectedApps_viewer$key} from '../../../__generated__/ConnectedApps_viewer.graphql'
import Panel from '../../../components/Panel/Panel'
import ConnectedAppRow from './ConnectedAppRow'

interface Props {
  viewerRef: ConnectedApps_viewer$key
}

const ConnectedApps = ({viewerRef}: Props) => {
  const {oauthGrants} = useFragment(
    graphql`
      fragment ConnectedApps_viewer on User {
        oauthGrants {
          id
          ...ConnectedAppRow_grant
        }
      }
    `,
    viewerRef
  )
  if (oauthGrants.length === 0) return null
  return (
    <Panel label='Connected Apps' casing='capitalize'>
      <div className='overflow-x-auto border-hairline border-t'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-hairline border-b bg-surface-raised text-left text-fg-muted text-xs uppercase tracking-wider'>
              <th className='px-4 py-2 font-semibold'>App</th>
              <th className='px-4 py-2 font-semibold'>Access</th>
              <th className='px-4 py-2 font-semibold'>Scopes</th>
              <th className='px-4 py-2 font-semibold'>Connected</th>
              <th className='px-4 py-2 font-semibold'>Last Used</th>
              <th className='px-4 py-2' />
            </tr>
          </thead>
          <tbody>
            {oauthGrants.map((grant) => (
              <ConnectedAppRow key={grant.id} grantRef={grant} />
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

export default ConnectedApps

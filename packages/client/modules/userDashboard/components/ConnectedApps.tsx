import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ConnectedApps_viewer$key} from '../../../__generated__/ConnectedApps_viewer.graphql'
import Panel from '../../../components/Panel/Panel'
import ConnectedAppRow from './ConnectedAppRow'

interface Props {
  viewerRef: ConnectedApps_viewer$key
}

const ConnectedApps = ({viewerRef}: Props) => {
  const viewer = useFragment(
    graphql`
      fragment ConnectedApps_viewer on User {
        aiAppGrants {
          id
          ...ConnectedAppRow_grant
        }
      }
    `,
    viewerRef
  )
  const {aiAppGrants} = viewer
  return (
    <Panel label='Connected Apps' casing='capitalize'>
      <div className='border-hairline border-t px-4 py-3 text-fg-secondary text-sm'>
        Apps you’ve connected to your Parabol account. Disconnecting removes an app from all your
        organizations.
      </div>
      {aiAppGrants.length === 0 ? (
        <div className='border-hairline border-t p-8 text-center text-sm'>
          <p className='m-0 font-semibold text-fg-primary'>No connected apps</p>
          <p className='m-0 text-fg-secondary'>
            Apps you connect, like Claude or ChatGPT, show up here.
          </p>
        </div>
      ) : (
        <div className='overflow-x-auto border-hairline border-t'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='border-hairline border-b bg-surface-raised text-left text-fg-muted text-xs uppercase tracking-wider'>
                <th className='px-4 py-2 font-semibold'>App</th>
                <th className='px-4 py-2 font-semibold'>Organizations</th>
                <th className='px-4 py-2 font-semibold'>Can do</th>
                <th className='px-4 py-2 font-semibold'>Connected</th>
                <th className='px-4 py-2 font-semibold'>Last used</th>
                <th className='px-4 py-2'>
                  <span className='sr-only'>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {aiAppGrants.map((grant) => (
                <ConnectedAppRow key={grant.id} grantRef={grant} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

export default ConnectedApps

import {Link} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {OrgAIAppsStatusRowQuery} from '../../../../__generated__/OrgAIAppsStatusRowQuery.graphql'
import BaseTag from '../../../../components/Tag/BaseTag'
import plural from '../../../../utils/plural'
import getEffectiveAIAppsPolicy from '../OrgAIApps/getEffectiveAIAppsPolicy'

interface Props {
  queryRef: PreloadedQuery<OrgAIAppsStatusRowQuery>
}

const POLICY_LABELS = {
  ALL: 'All apps',
  VERIFIED: 'Verified apps',
  NONE: 'No apps'
}

const OrgAIAppsStatusRow = ({queryRef}: Props) => {
  const data = usePreloadedQuery<OrgAIAppsStatusRowQuery>(
    graphql`
      query OrgAIAppsStatusRowQuery($orgId: ID!) {
        viewer {
          organization(orgId: $orgId) {
            id
            useAI
            aiAppsPolicy
            aiAppGrants {
              id
              user {
                id
              }
            }
          }
        }
      }
    `,
    queryRef
  )
  const {organization} = data.viewer
  if (!organization) return null
  const {id: orgId, useAI, aiAppsPolicy, aiAppGrants} = organization
  const connectionCount = aiAppGrants.length
  const memberCount = new Set(aiAppGrants.map(({user}) => user.id)).size
  const label = POLICY_LABELS[getEffectiveAIAppsPolicy(aiAppsPolicy, useAI)]
  return (
    <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-hairline border-t px-4 py-3'>
      <div>
        <div className='font-semibold text-fg-primary'>Apps</div>
        <div className='text-fg-secondary text-sm'>
          Apps like Claude and ChatGPT that members connect
        </div>
      </div>
      <div className='flex flex-wrap items-center gap-3 text-sm'>
        <BaseTag className='ml-0 bg-slate-600 text-white'>
          {aiAppsPolicy ? label : `${label} · following this switch`}
        </BaseTag>
        <span className='text-fg-secondary'>
          {connectionCount} {plural(connectionCount, 'connection')} from {memberCount}{' '}
          {plural(memberCount, 'member')}
        </span>
        <Link
          to='/me/organizations/$orgId/integrations'
          params={{orgId}}
          className='font-semibold text-accent hover:underline'
        >
          Manage in Integration Settings
        </Link>
      </div>
    </div>
  )
}

export default OrgAIAppsStatusRow

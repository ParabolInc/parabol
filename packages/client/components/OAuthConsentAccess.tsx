import type {OrgTeamGrant_viewer$key} from '../__generated__/OrgTeamGrant_viewer.graphql'
import type useResourceGrants from '../hooks/useResourceGrants'
import {OrgTeamGrant} from '../modules/userDashboard/components/OrgTeamGrant'
import {PageGrant} from '../modules/userDashboard/components/PageGrant'

interface Props {
  appName: string
  viewerRef: OrgTeamGrant_viewer$key
  resourceGrants: ReturnType<typeof useResourceGrants>
}

const OAuthConsentAccess = ({appName, viewerRef, resourceGrants}: Props) => (
  <div className='flex flex-col gap-4'>
    <div>
      <h3 className='m-0 font-semibold text-fg-muted text-xs uppercase tracking-wider'>Access</h3>
      <p className='m-0 mt-1 text-fg-muted text-xs'>
        By default, {appName} can reach everything you can. Optionally restrict it to specific
        organizations, teams, or pages.
      </p>
    </div>
    <OrgTeamGrant viewerRef={viewerRef} {...resourceGrants} />
    <PageGrant {...resourceGrants} />
  </div>
)

export default OAuthConsentAccess

import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import {OrgIntegrations_organization$key} from '../../../../__generated__/OrgIntegrations_organization.graphql'
import {Loader} from '../../../../utils/relay/renderLoader'
import GitLabProviders from './GitLabProviders'

type Props = {
  organizationRef: OrgIntegrations_organization$key
}

const OrgIntegrations = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgIntegrations_organization on Organization {
        id
        ...GitLabProviders_organization
        createdAt
        tier
        viewerOrganizationUser {
          id
          role
        }
        organizationUsers {
          edges {
            node {
              role
            }
          }
        }
      }
    `,
    organizationRef
  )

  const {id: orgId, viewerOrganizationUser, organizationUsers} = organization
  const history = useHistory()
  const isOrgAdmin = viewerOrganizationUser?.role === 'ORG_ADMIN'

  const orgUsers = organizationUsers?.edges.map((edge) => edge.node)
  const isAnyOrgAdmins = orgUsers?.some((user) => user.role === 'ORG_ADMIN')

  return (
    <Suspense fallback={<Loader />}>
      <div className='flex w-full flex-wrap'>
        <div className='w-[768px] max-w-[768px]'>
          <h1>Integration Settings</h1>
          {isOrgAdmin ? (
            <div className='text-base text-slate-700'>
              Configure organization-level integrations that can be used by teams across your
              organization.
              <br />
              See the team integration tab for team-level connections.
            </div>
          ) : (
            <div className='text-slate-700'>
              {`Organization-level integrations are managed by `}
              <a
                href='https://www.parabol.co/support/roles-on-parabol'
                className='font-bold text-sky-500 hover:text-sky-600'
                target='_blank'
              >
                Org Admins
              </a>
              {`.`}
              {isAnyOrgAdmins ? (
                <>
                  {` View yours `}
                  <button
                    onClick={() => history.push(`/me/organizations/${orgId}/billing`)}
                    className='cursor-pointer bg-transparent p-0 font-bold text-sky-500 hover:text-sky-600'
                  >
                    here
                  </button>
                  {`.`}
                </>
              ) : null}
            </div>
          )}
          <GitLabProviders organizationRef={organization} />
        </div>
      </div>
    </Suspense>
  )
}

export default OrgIntegrations

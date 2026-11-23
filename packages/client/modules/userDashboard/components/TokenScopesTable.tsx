import type {OAuthScopeEnum} from '../../../__generated__/useCreatePersonalAccessTokenMutation.graphql'
import {Checkbox} from '../../../ui/Checkbox/Checkbox'

const SCOPE_GROUPS = [
  {resource: 'Comments', read: 'COMMENTS_READ', write: 'COMMENTS_WRITE'},
  {resource: 'Meetings', read: 'MEETINGS_READ', write: 'MEETINGS_WRITE'},
  {resource: 'Organizations', read: 'ORGS_READ', write: 'ORGS_WRITE'},
  {resource: 'Pages', read: 'PAGES_READ', write: 'PAGES_WRITE'},
  {resource: 'Reports', read: 'REPORTS_READ', write: 'REPORTS_WRITE'},
  {resource: 'Tasks', read: 'TASKS_READ', write: 'TASKS_WRITE'},
  {resource: 'Teams', read: 'TEAMS_READ', write: 'TEAMS_WRITE'},
  {resource: 'Templates', read: 'TEMPLATES_READ', write: 'TEMPLATES_WRITE'},
  {resource: 'Users', read: 'USERS_READ', write: 'USERS_WRITE'}
] as const

interface Props {
  selectedScopes: Set<OAuthScopeEnum>
  toggleScope: (scope: OAuthScopeEnum, pairedRead?: OAuthScopeEnum) => void
  // the scopes on offer; omitted means every scope
  availableScopes?: ReadonlySet<OAuthScopeEnum>
}

export const TokenScopesTable = ({selectedScopes, toggleScope, availableScopes}: Props) => {
  const isAvailable = (scope: OAuthScopeEnum) => !availableScopes || availableScopes.has(scope)
  const scopeGroups = SCOPE_GROUPS.filter(
    (group) => isAvailable(group.read) || isAvailable(group.write)
  )
  return (
    <div className='flex flex-col gap-2'>
      <label className='font-semibold text-fg-muted text-xs uppercase tracking-wider'>Scopes</label>
      <div className='overflow-hidden rounded-md border border-hairline'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-hairline border-b bg-surface-raised'>
              <th className='py-2 pr-3 pl-3 text-left font-semibold text-fg-secondary text-xs'>
                Resource
              </th>
              <th className='w-10 py-2 pr-1 pl-1 text-center font-semibold text-fg-secondary text-xs'>
                Read
              </th>
              <th className='w-10 py-2 pr-1 pl-1 text-center font-semibold text-fg-secondary text-xs'>
                Write
              </th>
            </tr>
          </thead>
          <tbody>
            {scopeGroups.map((group) => (
              <tr key={group.resource} className='border-hairline border-b last:border-0'>
                <td className='py-2 pr-3 pl-3 text-fg-primary'>{group.resource}</td>
                <td className='w-10 py-2'>
                  {isAvailable(group.read) && (
                    <Checkbox
                      aria-label={`Read ${group.resource}`}
                      checked={selectedScopes.has(group.read)}
                      onCheckedChange={() => toggleScope(group.read)}
                      className='mx-auto'
                    />
                  )}
                </td>
                <td className='w-10 py-2'>
                  {isAvailable(group.write) && (
                    <Checkbox
                      aria-label={`Write ${group.resource}`}
                      checked={selectedScopes.has(group.write)}
                      onCheckedChange={() =>
                        toggleScope(group.write, isAvailable(group.read) ? group.read : undefined)
                      }
                      className='mx-auto'
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

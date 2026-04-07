import type {OAuthScopeEnum} from '../../../__generated__/useCreatePersonalAccessTokenMutation.graphql'
import {Checkbox} from '../../../ui/Checkbox/Checkbox'

const SCOPE_GROUPS = [
  {resource: 'Comments', read: 'COMMENTS_READ', write: 'COMMENTS_WRITE'},
  {resource: 'Meetings', read: 'MEETINGS_READ', write: 'MEETINGS_WRITE'},
  {resource: 'Organizations', read: 'ORG_READ', write: 'ORG_WRITE'},
  {resource: 'Pages', read: 'PAGES_READ', write: 'PAGES_WRITE'},
  {resource: 'Tasks', read: 'TASKS_READ', write: 'TASKS_WRITE'},
  {resource: 'Teams', read: 'TEAMS_READ', write: 'TEAMS_WRITE'},
  {resource: 'Templates', read: 'TEMPLATES_READ', write: 'TEMPLATES_WRITE'},
  {resource: 'Users', read: 'USERS_READ', write: 'USERS_WRITE'}
] as const

interface Props {
  selectedScopes: Set<OAuthScopeEnum>
  toggleScope: (scope: OAuthScopeEnum, pairedRead?: OAuthScopeEnum) => void
}

export const TokenScopesTable = ({selectedScopes, toggleScope}: Props) => {
  return (
    <div className='flex flex-col gap-2'>
      <label className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
        Scopes
      </label>
      <div className='overflow-hidden rounded-md border border-slate-200'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-slate-200 border-b bg-slate-50'>
              <th className='py-2 pr-3 pl-3 text-left font-semibold text-slate-600 text-xs'>
                Resource
              </th>
              <th className='w-10 py-2 pr-1 pl-1 text-center font-semibold text-slate-600 text-xs'>
                Read
              </th>
              <th className='w-10 py-2 pr-1 pl-1 text-center font-semibold text-slate-600 text-xs'>
                Write
              </th>
            </tr>
          </thead>
          <tbody>
            {SCOPE_GROUPS.map((group) => (
              <tr key={group.resource} className='border-slate-100 border-b last:border-0'>
                <td className='py-2 pr-3 pl-3 text-slate-700'>{group.resource}</td>
                <td className='w-10 py-2'>
                  <Checkbox
                    checked={selectedScopes.has(group.read)}
                    onCheckedChange={() => toggleScope(group.read)}
                    className='mx-auto'
                  />
                </td>
                <td className='w-10 py-2'>
                  <Checkbox
                    checked={selectedScopes.has(group.write)}
                    onCheckedChange={() => toggleScope(group.write, group.read)}
                    className='mx-auto'
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

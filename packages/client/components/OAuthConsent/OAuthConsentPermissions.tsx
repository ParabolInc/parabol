import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OAuthConsentPermissions_request$key} from '../../__generated__/OAuthConsentPermissions_request.graphql'
import {
  Business,
  Comment,
  Description,
  Forum,
  Group,
  Insights,
  Person,
  Style,
  TaskAlt
} from '../../ui/icons'

const RESOURCES = [
  {key: 'PAGES', title: 'Pages', noun: 'pages', Icon: Description},
  {key: 'TASKS', title: 'Tasks', noun: 'tasks', Icon: TaskAlt},
  {key: 'MEETINGS', title: 'Meetings', noun: 'meetings', Icon: Forum},
  {key: 'COMMENTS', title: 'Comments', noun: 'comments', Icon: Comment},
  {key: 'TEMPLATES', title: 'Templates', noun: 'meeting templates', Icon: Style},
  {key: 'TEAMS', title: 'Teams', noun: 'teams', Icon: Group},
  {key: 'REPORTS', title: 'Reports', noun: 'reports', Icon: Insights},
  {key: 'ORGS', title: 'Organizations', noun: 'organization details', Icon: Business},
  {key: 'USERS', title: 'Profile', noun: 'your profile', Icon: Person}
] as const

const describe = (noun: string, canRead: boolean, canWrite: boolean) => {
  if (canRead && canWrite) return `Read, create and update ${noun}`
  return canRead ? `Read ${noun}` : `Create and update ${noun}`
}

interface Props {
  requestRef: OAuthConsentPermissions_request$key
}

const OAuthConsentPermissions = ({requestRef}: Props) => {
  const {scopes} = useFragment(
    graphql`
      fragment OAuthConsentPermissions_request on OAuthAuthorizationRequest {
        scopes
      }
    `,
    requestRef
  )
  const permissions = RESOURCES.map(({key, title, noun, Icon}) => {
    const canRead = scopes.includes(`${key}_READ`)
    const canWrite = scopes.includes(`${key}_WRITE`)
    return {
      key,
      title,
      Icon,
      isGranted: canRead || canWrite,
      description: describe(noun, canRead, canWrite)
    }
  }).filter(({isGranted}) => isGranted)
  return (
    <section aria-labelledby='oauth-consent-permissions' className='flex flex-col gap-2'>
      <h2
        id='oauth-consent-permissions'
        className='m-0 font-semibold text-fg-muted text-xs uppercase leading-4 tracking-[0.08em]'
      >
        It will be able to
      </h2>
      {permissions.length > 0 ? (
        <ul className='m-0 list-none p-0'>
          {permissions.map(({key, title, Icon, description}) => (
            <li key={key} className='flex items-start gap-3 py-1.5 text-sm'>
              <Icon className='mt-px text-fg-secondary text-xl' />
              <span>
                <span className='block font-semibold'>{title}</span>
                <span className='block text-[13px] text-fg-secondary leading-[18px]'>
                  {description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className='m-0 text-sm'>Nothing yet. It isn’t asking for any permissions.</p>
      )}
    </section>
  )
}

export default OAuthConsentPermissions

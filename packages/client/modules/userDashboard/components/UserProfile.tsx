import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {UserProfileQuery} from '../../../__generated__/UserProfileQuery.graphql'
import DeleteAccount from '../../../components/DeleteAccount'
import EmailNotifications from '../../../components/EmailNotifications'
import Panel from '../../../components/Panel/Panel'
import PasswordResetLink from '../../../components/PasswordResetLink'
import useDocumentTitle from '../../../hooks/useDocumentTitle'
import {AuthIdentityTypeEnum} from '../../../types/constEnums'
import PersonalAccessTokens from './PersonalAccessTokens'
import UserSettingsForm from './UserSettingsForm/UserSettingsForm'
import UserSettingsWrapper from './UserSettingsWrapper/UserSettingsWrapper'

interface Props {
  teamId: string
  queryRef: PreloadedQuery<UserProfileQuery>
}

const query = graphql`
  query UserProfileQuery {
    viewer {
      ...PasswordResetLink_viewer
      ...EmailNotifications_viewer
      ...DeleteAccount_viewer
      ...PersonalAccessTokens_viewer
      preferredName
      picture
      identities {
        type
      }
    }
  }
`

const UserProfile = ({queryRef}: Props) => {
  const data = usePreloadedQuery<UserProfileQuery>(query, queryRef)
  const {viewer} = data
  const {identities} = viewer
  const isLocal = identities?.find((identity) => identity?.type === AuthIdentityTypeEnum.LOCAL)
  useDocumentTitle('My Profile | Parabol', 'My Profile')
  return (
    <UserSettingsWrapper>
      <div className='w-full'>
        <Panel label='Profile' casing={'capitalize'}>
          <UserSettingsForm viewer={viewer} />
        </Panel>
        {isLocal && (
          <Panel label='Authentication' casing={'capitalize'}>
            <div className='border-slate-300 border-t p-4 text-center'>
              <PasswordResetLink viewerRef={viewer} />
            </div>
          </Panel>
        )}
        <Panel label='Email Notifications' casing={'capitalize'}>
          <div className='border-slate-300 border-t p-4 text-center'>
            <EmailNotifications viewerRef={viewer} />
          </div>
        </Panel>
        <PersonalAccessTokens viewerRef={viewer} />
        <Panel label='Danger Zone' casing={'capitalize'}>
          <div className='border-slate-300 border-t p-4 text-center'>
            <DeleteAccount viewerRef={viewer} />
          </div>
        </Panel>
      </div>
    </UserSettingsWrapper>
  )
}

export default UserProfile

import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import DeleteAccount from '../../../components/DeleteAccount'
import Panel from '../../../components/Panel/Panel'
import PasswordResetLink from '../../../components/PasswordResetLink'
import useDocumentTitle from '../../../hooks/useDocumentTitle'
import {PALETTE} from '../../../styles/paletteV3'
import {AuthIdentityTypeEnum, Layout} from '../../../types/constEnums'
import {UserProfileQuery} from '../../../__generated__/UserProfileQuery.graphql'
import UserSettingsForm from './UserSettingsForm/UserSettingsForm'
import UserSettingsWrapper from './UserSettingsWrapper/UserSettingsWrapper'

const SettingsBlock = styled('div')({
  width: '100%'
})

const PanelRow = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  padding: Layout.ROW_GUTTER,
  textAlign: 'center'
})

interface Props {
  teamId: string
  queryRef: PreloadedQuery<UserProfileQuery>
}

const query = graphql`
  query UserProfileQuery {
    viewer {
      ...PasswordResetLink_viewer
      preferredName
      picture
      identities {
        type
      }
    }
  }
`

const UserProfile = ({queryRef}: Props) => {
  const data = usePreloadedQuery<UserProfileQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const {identities} = viewer
  const isLocal = identities?.find((identity) => identity?.type === AuthIdentityTypeEnum.LOCAL)
  useDocumentTitle('My Profile | Parabol', 'My Profile')
  return (
    <UserSettingsWrapper>
      <SettingsBlock>
        <Panel label='Profile' casing={'capitalize'}>
          <UserSettingsForm viewer={viewer} />
        </Panel>
        {isLocal && (
          <Panel label='Authentication' casing={'capitalize'}>
            <PanelRow>
              <PasswordResetLink viewerRef={viewer} />
            </PanelRow>
          </Panel>
        )}
        <Panel label='Danger Zone' casing={'capitalize'}>
          <PanelRow>
            <DeleteAccount />
          </PanelRow>
        </Panel>
      </SettingsBlock>
    </UserSettingsWrapper>
  )
}

export default UserProfile

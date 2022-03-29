import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import DeleteAccount from '../../../components/DeleteAccount'
import Panel from '../../../components/Panel/Panel'
import useDocumentTitle from '../../../hooks/useDocumentTitle'
import {PALETTE} from '../../../styles/paletteV3'
import {Layout} from '../../../types/constEnums'
import UserSettingsWrapper from './UserSettingsWrapper/UserSettingsWrapper'
import {UserProfileQuery} from '../../../__generated__/UserProfileQuery.graphql'
import UserSettingsForm from './UserSettingsForm/UserSettingsForm'

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
      preferredName
      picture
    }
  }
`

const UserProfile = ({queryRef}: Props) => {
  const data = usePreloadedQuery<UserProfileQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  useDocumentTitle('My Profile | Parabol', 'My Profile')
  return (
    <UserSettingsWrapper>
      <SettingsBlock>
        <Panel label='My Information'>
          <UserSettingsForm viewer={viewer} />
        </Panel>
        <Panel label='Danger Zone'>
          <PanelRow>
            <DeleteAccount />
          </PanelRow>
        </Panel>
      </SettingsBlock>
    </UserSettingsWrapper>
  )
}

export default UserProfile

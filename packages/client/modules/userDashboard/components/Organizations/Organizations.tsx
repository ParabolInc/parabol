import React from 'react'
import {createFragmentContainer} from 'react-relay'
import EmptyOrgsCallOut from '../EmptyOrgsCallOut/EmptyOrgsCallOut'
import OrganizationRow from '../OrganizationRow/OrganizationRow'
import UserSettingsWrapper from '../UserSettingsWrapper/UserSettingsWrapper'
import LinkButton from '../../../../components/LinkButton'
import Panel from '../../../../components/Panel/Panel'
import graphql from 'babel-plugin-relay/macro'
import SettingsWrapper from '../../../../components/Settings/SettingsWrapper'
import {Organizations_viewer} from '__generated__/Organizations_viewer.graphql'
import useRouter from '../../../../hooks/useRouter'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'

interface Props {
  viewer: Organizations_viewer
}
const Organizations = (props: Props) => {
  const {history} = useRouter()
  const {viewer} = props
  const {organizations} = viewer
  const gotoNewTeam = () => {
    history.push('/newteam')
  }
  const addNewOrg = () => (
    <LinkButton aria-label='Tap to create a new organzation' onClick={gotoNewTeam} palette='blue'>
      {'Add New Organization'}
    </LinkButton>
  )
  useDocumentTitle('My Organizations | Parabol', 'Organizations')
  return (
    <UserSettingsWrapper>
      <SettingsWrapper>
        {organizations.length ? (
          <Panel label='Organizations' controls={addNewOrg()}>
            {organizations.map((organization) => (
              <OrganizationRow key={`orgRow${organization.id}`} organization={organization} />
            ))}
          </Panel>
        ) : (
          <EmptyOrgsCallOut />
        )}
      </SettingsWrapper>
    </UserSettingsWrapper>
  )
}

export default createFragmentContainer(Organizations, {
  viewer: graphql`
    fragment Organizations_viewer on User {
      organizations {
        ...OrganizationRow_organization
        id
        isBillingLeader
        orgUserCount {
          activeUserCount
          inactiveUserCount
        }
        name
        picture
        tier
      }
    }
  `
})

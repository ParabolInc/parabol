import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import LinkButton from '../../../../components/LinkButton'
import Panel from '../../../../components/Panel/Panel'
import SettingsWrapper from '../../../../components/Settings/SettingsWrapper'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'
import useRouter from '../../../../hooks/useRouter'
import {OrganizationsQuery} from '../../../../__generated__/OrganizationsQuery.graphql'
import EmptyOrgsCallOut from '../EmptyOrgsCallOut/EmptyOrgsCallOut'
import OrganizationRow from '../OrganizationRow/OrganizationRow'
import UserSettingsWrapper from '../UserSettingsWrapper/UserSettingsWrapper'

interface Props {
  queryRef: PreloadedQuery<OrganizationsQuery>
}
const query = graphql`
  query OrganizationsQuery {
    viewer {
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
  }
`

const Organizations = (props: Props) => {
  const {history} = useRouter()
  const {queryRef} = props
  const data = usePreloadedQuery<OrganizationsQuery>(query, queryRef)
  const {viewer} = data
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

export default Organizations

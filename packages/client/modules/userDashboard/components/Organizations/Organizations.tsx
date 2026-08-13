import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {useNavigate} from 'react-router'
import type {OrganizationsQuery} from '../../../../__generated__/OrganizationsQuery.graphql'
import Panel from '../../../../components/Panel/Panel'
import SettingsWrapper from '../../../../components/Settings/SettingsWrapper'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'
import {Button} from '../../../../ui/Button/Button'
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
      }
    }
  }
`

const Organizations = (props: Props) => {
  const navigate = useNavigate()
  const {queryRef} = props
  const data = usePreloadedQuery<OrganizationsQuery>(query, queryRef)
  const {viewer} = data
  const {organizations} = viewer
  const gotoNewTeam = () => {
    navigate('/newteam')
  }
  const isSingleOrg = window.__ACTION__.IS_SINGLE_ORG
  const addNewOrg = isSingleOrg
    ? undefined
    : () => (
        <Button
          size='default'
          aria-label='Tap to create a new organzation'
          onClick={gotoNewTeam}
          className='bg-transparent p-0 text-[14px] text-sky-500 leading-5 shadow-none hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
        >
          {'Add New Organization'}
        </Button>
      )
  useDocumentTitle('My Organizations | Parabol', 'Organizations')
  return (
    <UserSettingsWrapper>
      <SettingsWrapper>
        {organizations.length ? (
          <Panel label='Organizations' controls={addNewOrg?.()}>
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

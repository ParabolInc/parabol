import {useLocation, useNavigate} from 'react-router-dom'
import ToggleNav, {type Item} from '../../../../components/ToggleNav/ToggleNav'
import {AUTHENTICATION_PAGE, BILLING_PAGE, MEMBERS_PAGE} from '../../../../utils/constants'

interface Props {
  orgId: string
}
const BillingMembersToggle = (props: Props) => {
  const navigate = useNavigate()
  const {pathname} = useLocation()
  const {orgId} = props
  const segments = pathname.split('/')
  const lastSegment = segments[segments.length - 1]
  const knownAreas = [BILLING_PAGE, MEMBERS_PAGE, AUTHENTICATION_PAGE]
  const activeOrgDetail = knownAreas.includes(lastSegment as any) ? lastSegment : BILLING_PAGE

  const items: Item[] = [
    {
      label: 'Billing',
      icon: 'credit_card' as const,
      isActive: activeOrgDetail === BILLING_PAGE,
      onClick: () => navigate(`/me/organizations/${orgId}/${BILLING_PAGE}`)
    },
    {
      label: 'Members',
      icon: 'group' as const,
      isActive: activeOrgDetail === MEMBERS_PAGE,
      onClick: () => navigate(`/me/organizations/${orgId}/${MEMBERS_PAGE}`)
    },
    {
      label: 'Authentication',
      icon: 'key' as const,
      isActive: activeOrgDetail === AUTHENTICATION_PAGE,
      onClick: () => navigate(`/me/organizations/${orgId}/${AUTHENTICATION_PAGE}`)
    }
  ]
  return <ToggleNav items={items} />
}

export default BillingMembersToggle

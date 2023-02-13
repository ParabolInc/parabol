import React from 'react'
import {matchPath} from 'react-router-dom'
import ToggleNav from '../../../../components/ToggleNav/ToggleNav'
import useRouter from '../../../../hooks/useRouter'
import {AUTHENTICATION_PAGE, BILLING_PAGE, MEMBERS_PAGE} from '../../../../utils/constants'

interface Props {
  orgId: string
  hasSamlFeatureFlag?: boolean
}
const BillingMembersToggle = (props: Props) => {
  const {
    history,
    location: {pathname},
    match
  } = useRouter()
  const {orgId, hasSamlFeatureFlag} = props
  const areaMatch = matchPath<{area: string}>(pathname, {path: `${match.url}/:area?`})
  const activeOrgDetail = areaMatch?.params.area ?? BILLING_PAGE

  const items = [
    {
      label: 'Billing',
      icon: 'credit_card' as const,
      isActive: activeOrgDetail === BILLING_PAGE,
      onClick: () => history.push(`/me/organizations/${orgId}/${BILLING_PAGE}`)
    },
    {
      label: 'Members',
      icon: 'group' as const,
      isActive: activeOrgDetail === MEMBERS_PAGE,
      onClick: () => history.push(`/me/organizations/${orgId}/${MEMBERS_PAGE}`)
    },
    {
      label: 'Authentication',
      icon: 'key' as const,
      isActive: activeOrgDetail === AUTHENTICATION_PAGE,
      onClick: () => history.push(`/me/organizations/${orgId}/${AUTHENTICATION_PAGE}`)
    }
  ]

  const tabs = hasSamlFeatureFlag ? items : items.slice(0, 2)

  return <ToggleNav items={tabs} />
}

export default BillingMembersToggle

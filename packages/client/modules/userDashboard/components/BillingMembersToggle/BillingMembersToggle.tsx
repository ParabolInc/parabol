import React from 'react'
import {useTranslation} from 'react-i18next'
import {matchPath} from 'react-router-dom'
import ToggleNav from '../../../../components/ToggleNav/ToggleNav'
import useRouter from '../../../../hooks/useRouter'
import {BILLING_PAGE, MEMBERS_PAGE} from '../../../../utils/constants'

interface Props {
  orgId: string
}
const BillingMembersToggle = (props: Props) => {
  const {t} = useTranslation()

  const {
    history,
    location: {pathname},
    match
  } = useRouter()
  const {orgId} = props
  const areaMatch = matchPath<{area: string}>(pathname, {
    path: t('BillingMembersToggle.MatchUrlArea', {
      matchUrl: match.url
    })
  })
  const activeOrgDetail = areaMatch?.params.area ?? BILLING_PAGE
  const items = [
    {
      label: t('BillingMembersToggle.Billing'),
      icon: 'credit_card',
      isActive: activeOrgDetail === BILLING_PAGE,
      onClick: () =>
        history.push(
          t('BillingMembersToggle.MeOrganizationsOrgIdBillingPage', {
            orgId,
            billingPage: BILLING_PAGE
          })
        )
    },
    {
      label: t('BillingMembersToggle.Members'),
      icon: 'group',
      isActive: activeOrgDetail === MEMBERS_PAGE,
      onClick: () =>
        history.push(
          t('BillingMembersToggle.MeOrganizationsOrgIdMembersPage', {
            orgId,
            membersPage: MEMBERS_PAGE
          })
        )
    }
  ]

  return <ToggleNav items={items} />
}

export default BillingMembersToggle

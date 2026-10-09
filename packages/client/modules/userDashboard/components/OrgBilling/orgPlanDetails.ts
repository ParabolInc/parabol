import type {TierEnum} from '../../../../__generated__/OrganizationSubscription.graphql'
import {Threshold} from '../../../../types/constEnums'
import {MONTHLY_PRICE} from '../../../../utils/constants'

export type PlanBenefit = {
  title: string
  detail?: string
}

type PlanDetails = {
  audience: string
  price: string
  priceUnit: string
  note?: string
  included: readonly PlanBenefit[]
  limits?: readonly PlanBenefit[]
}

const orgPlanDetails: Record<TierEnum, PlanDetails> = {
  starter: {
    audience: 'For a team or two finding their rhythm',
    price: '$0',
    priceUnit: 'free',
    note: 'No card, no time limit',
    included: [
      {title: 'Retros, Sprint Poker, standups, check-ins and Team Health'},
      {title: 'Unlimited teammates'},
      {title: 'Every Parabol template'},
      {title: 'Jira, GitHub, GitLab, Slack', detail: 'and other integrations'}
    ],
    limits: [
      {title: `${Threshold.MAX_STARTER_TIER_TEAMS} teams`},
      {title: '30 days', detail: 'of meeting history'},
      {title: 'AI preview'},
      {title: '2 custom templates', detail: 'per meeting type'}
    ]
  },
  team: {
    audience: 'For orgs where every team runs on Parabol',
    price: `$${MONTHLY_PRICE}`,
    priceUnit: 'per active user / month',
    included: [
      {title: 'Unlimited teams', detail: 'and custom templates'},
      {title: 'Unlimited meeting history'},
      {title: 'AI in every meeting:', detail: 'summaries, suggested groups, discussion prompts'},
      {title: 'Private teams', detail: 'for sensitive conversations'},
      {title: 'Unlimited exports', detail: 'from Sprint Poker'},
      {title: 'Priority support'}
    ]
  },
  enterprise: {
    audience: 'For companies with security and procurement requirements',
    price: 'Custom',
    priceUnit: 'billed annually',
    note: 'Flat annual price, no surprise bills',
    included: [
      {title: 'SAML single sign-on'},
      {title: 'SCIM user provisioning'},
      {title: 'Domain allowlisting,', detail: 'so only your people can join'},
      {title: 'Org admins', detail: 'who manage SSO, integrations and org settings'},
      {title: 'Self-hosted Jira Data Center and GitLab'},
      {title: 'On-premises or single-tenant hosting'},
      {title: 'Uptime SLA', detail: 'and a dedicated account manager'}
    ]
  }
}

export default orgPlanDetails

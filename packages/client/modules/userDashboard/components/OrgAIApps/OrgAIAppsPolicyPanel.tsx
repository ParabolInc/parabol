import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {
  OrgAIAppsPolicyEnum,
  OrgAIAppsPolicyPanel_organization$key
} from '../../../../__generated__/OrgAIAppsPolicyPanel_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import useUpdateOrgAIAppsPolicyMutation from '../../../../mutations/useUpdateOrgAIAppsPolicyMutation'
import getEffectiveAIAppsPolicy from './getEffectiveAIAppsPolicy'
import isAIAppGrantBlocked from './isAIAppGrantBlocked'
import OrgAIAppsPolicyConfirmDialog from './OrgAIAppsPolicyConfirmDialog'
import OrgAIAppsPolicyHelp from './OrgAIAppsPolicyHelp'
import OrgAIAppsPolicyRadios from './OrgAIAppsPolicyRadios'

interface Props {
  organizationRef: OrgAIAppsPolicyPanel_organization$key
}

interface PendingPolicy {
  policy: OrgAIAppsPolicyEnum
  connectionCount: number
  memberCount: number
}

const OrgAIAppsPolicyPanel = ({organizationRef}: Props) => {
  const organization = useFragment(
    graphql`
      fragment OrgAIAppsPolicyPanel_organization on Organization {
        id
        name
        useAI
        aiAppsPolicy
        aiAppGrants {
          id
          clientVerifiedAt
          user {
            id
          }
        }
      }
    `,
    organizationRef
  )
  const {id: orgId, name, useAI, aiAppsPolicy, aiAppGrants} = organization
  const [pending, setPending] = useState<PendingPolicy | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const [updatePolicy, submitting] = useUpdateOrgAIAppsPolicyMutation()
  const effectivePolicy = getEffectiveAIAppsPolicy(aiAppsPolicy, useAI)
  const isFollowing = !aiAppsPolicy

  useEffect(() => {
    if (!submitting && document.activeElement === document.body) returnFocusRef.current?.focus()
  }, [submitting])

  const commitPolicy = (policy: OrgAIAppsPolicyEnum) => {
    updatePolicy({variables: {orgId, policy}, onCompleted: () => setPending(null)})
  }

  const handleChange = (policy: OrgAIAppsPolicyEnum) => {
    const {activeElement} = document
    returnFocusRef.current = activeElement instanceof HTMLElement ? activeElement : null
    const newlyBlocked = aiAppGrants.filter(
      ({clientVerifiedAt}) =>
        !isAIAppGrantBlocked(effectivePolicy, clientVerifiedAt) &&
        isAIAppGrantBlocked(policy, clientVerifiedAt)
    )
    if (newlyBlocked.length === 0) {
      commitPolicy(policy)
      return
    }
    const memberCount = new Set(newlyBlocked.map(({user}) => user.id)).size
    setPending({policy, connectionCount: newlyBlocked.length, memberCount})
  }

  return (
    <Panel className='max-w-[976px]' label='Apps'>
      <div className='border-hairline border-t px-4 py-3'>
        <div id='org-ai-apps-policy-label' className='font-semibold text-fg-primary'>
          Apps members can connect
        </div>
        <p className='mt-0 mb-3 text-fg-secondary'>
          Apps like Claude or ChatGPT that sign in as a member and reach {name}.
        </p>
        <OrgAIAppsPolicyRadios
          labelId='org-ai-apps-policy-label'
          value={effectivePolicy}
          isFollowing={isFollowing}
          disabled={submitting}
          onChange={handleChange}
        />
      </div>
      <OrgAIAppsPolicyHelp orgId={orgId} isFollowing={isFollowing} />
      {pending && (
        <OrgAIAppsPolicyConfirmDialog
          orgName={name}
          policy={pending.policy}
          connectionCount={pending.connectionCount}
          memberCount={pending.memberCount}
          submitting={submitting}
          onConfirm={() => commitPolicy(pending.policy)}
          onClose={() => setPending(null)}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            returnFocusRef.current?.focus()
          }}
        />
      )}
    </Panel>
  )
}

export default OrgAIAppsPolicyPanel

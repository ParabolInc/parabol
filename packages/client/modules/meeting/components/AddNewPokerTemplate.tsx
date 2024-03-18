import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import LinkButton from '../../../components/LinkButton'
import TooltipStyled from '../../../components/TooltipStyled'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddPokerTemplateMutation from '../../../mutations/AddPokerTemplateMutation'
import {AddNewPokerTemplate_pokerTemplates$key} from '../../../__generated__/AddNewPokerTemplate_pokerTemplates.graphql'
import {AddNewPokerTemplate_team$key} from '../../../__generated__/AddNewPokerTemplate_team.graphql'

const ErrorLine = styled(TooltipStyled)({
  margin: '0 0 8px'
})

const AddPokerTemplateLink = styled(LinkButton)({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-start',
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px',
  outline: 'none',
  padding: '20px 16px',
  width: '100%'
})

interface Props {
  gotoTeamTemplates: () => void
  pokerTemplatesRef: AddNewPokerTemplate_pokerTemplates$key
  teamRef: AddNewPokerTemplate_team$key
  displayUpgradeDetails: () => void
}

const AddNewPokerTemplate = (props: Props) => {
  const {gotoTeamTemplates, teamRef, pokerTemplatesRef, displayUpgradeDetails} = props
  const atmosphere = useAtmosphere()
  const pokerTemplates = useFragment(
    graphql`
      fragment AddNewPokerTemplate_pokerTemplates on PokerTemplate @relay(plural: true) {
        name
      }
    `,
    pokerTemplatesRef
  )
  const team = useFragment(
    graphql`
      fragment AddNewPokerTemplate_team on Team {
        id
        tier
        viewerTeamMember {
          id
          user {
            id
            featureFlags {
              noTemplateLimit
            }
          }
        }
      }
    `,
    teamRef
  )
  const {id: teamId, tier, viewerTeamMember} = team
  const {onError, onCompleted, submitMutation, submitting, error} = useMutationProps()
  const errorTimerId = useRef<undefined | number>()
  useEffect(() => {
    return () => {
      window.clearTimeout(errorTimerId.current)
    }
  }, [])
  const canEditTemplates =
    tier !== 'starter' || viewerTeamMember?.user?.featureFlags?.noTemplateLimit
  const addNewTemplate = () => {
    if (submitting) return
    if (!canEditTemplates) {
      displayUpgradeDetails()
      return
    }
    if (pokerTemplates.find((template) => template.name.startsWith('*New Template'))) {
      onError(new Error('You already have a new template. Try renaming that one first.'))
      errorTimerId.current = window.setTimeout(() => {
        onCompleted()
      }, 8000)
      return
    }
    submitMutation()
    AddPokerTemplateMutation(atmosphere, {teamId}, {onError, onCompleted})
    gotoTeamTemplates()
  }

  const containsNewTemplate = pokerTemplates.find((template) =>
    template.name.startsWith('*New Template')
  )

  if (containsNewTemplate) return null
  return (
    <div>
      {error && <ErrorLine>{error.message}</ErrorLine>}
      <AddPokerTemplateLink palette='blue' onClick={addNewTemplate} waiting={submitting}>
        Create New Template {!canEditTemplates && '🔒'}
      </AddPokerTemplateLink>
    </div>
  )
}

export default AddNewPokerTemplate

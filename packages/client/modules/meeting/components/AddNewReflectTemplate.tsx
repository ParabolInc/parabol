import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import LinkButton from '../../../components/LinkButton'
import TooltipStyled from '../../../components/TooltipStyled'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddReflectTemplateMutation from '../../../mutations/AddReflectTemplateMutation'
import {AddNewReflectTemplate_reflectTemplates$key} from '../../../__generated__/AddNewReflectTemplate_reflectTemplates.graphql'
import {AddNewReflectTemplate_team$key} from '../../../__generated__/AddNewReflectTemplate_team.graphql'

const ErrorLine = styled(TooltipStyled)({
  margin: '0 0 8px'
})

const AddRetroTemplateLink = styled(LinkButton)({
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
  reflectTemplatesRef: AddNewReflectTemplate_reflectTemplates$key
  displayUpgradeDetails: () => void
  teamRef: AddNewReflectTemplate_team$key
}

const AddNewReflectTemplate = (props: Props) => {
  const {gotoTeamTemplates, reflectTemplatesRef, teamRef, displayUpgradeDetails} = props
  const atmosphere = useAtmosphere()
  const reflectTemplates = useFragment(
    graphql`
      fragment AddNewReflectTemplate_reflectTemplates on ReflectTemplate @relay(plural: true) {
        name
      }
    `,
    reflectTemplatesRef
  )
  const team = useFragment(
    graphql`
      fragment AddNewReflectTemplate_team on Team {
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
    if (reflectTemplates.find((template) => template.name.startsWith('*New Template'))) {
      onError(new Error('You already have a new template. Try renaming that one first.'))
      errorTimerId.current = window.setTimeout(() => {
        onCompleted()
      }, 8000)
      return
    }
    submitMutation()
    AddReflectTemplateMutation(atmosphere, {teamId}, {onError, onCompleted})
    gotoTeamTemplates()
  }

  const containsNewTemplate = reflectTemplates.find((template) =>
    template.name.startsWith('*New Template')
  )

  if (containsNewTemplate) return null
  return (
    <div>
      {error && <ErrorLine>{error.message}</ErrorLine>}
      <AddRetroTemplateLink palette='blue' onClick={addNewTemplate} waiting={submitting}>
        Create New Template {!canEditTemplates && '🔒'}
      </AddRetroTemplateLink>
    </div>
  )
}

export default AddNewReflectTemplate

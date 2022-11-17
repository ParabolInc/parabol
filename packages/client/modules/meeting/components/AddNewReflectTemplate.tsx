import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import LinkButton from '../../../components/LinkButton'
import TooltipStyled from '../../../components/TooltipStyled'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddReflectTemplateMutation from '../../../mutations/AddReflectTemplateMutation'
import {Threshold} from '../../../types/constEnums'
import {AddNewReflectTemplate_reflectTemplates$key} from '../../../__generated__/AddNewReflectTemplate_reflectTemplates.graphql'
import {AddNewReflectTemplate_team$key} from '../../../__generated__/AddNewReflectTemplate_team.graphql'
import {AddNewReflectTemplate_viewer$key} from '../../../__generated__/AddNewReflectTemplate_viewer.graphql'

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
  viewerRef: AddNewReflectTemplate_viewer$key
  displayUpgradeDetails: () => void
  teamRef: AddNewReflectTemplate_team$key
}

const AddNewReflectTemplate = (props: Props) => {
  const {gotoTeamTemplates, reflectTemplatesRef, teamRef, viewerRef, displayUpgradeDetails} = props
  const atmosphere = useAtmosphere()
  const reflectTemplates = useFragment(
    graphql`
      fragment AddNewReflectTemplate_reflectTemplates on ReflectTemplate @relay(plural: true) {
        name
      }
    `,
    reflectTemplatesRef
  )
  const {featureFlags} = useFragment(
    graphql`
      fragment AddNewReflectTemplate_viewer on User {
        featureFlags {
          templateLimit
        }
      }
    `,
    viewerRef
  )
  const team = useFragment(
    graphql`
      fragment AddNewReflectTemplate_team on Team {
        id
        tier
      }
    `,
    teamRef
  )
  const {tier, id: teamId} = team
  const {onError, onCompleted, submitMutation, submitting, error} = useMutationProps()
  const errorTimerId = useRef<undefined | number>()
  useEffect(() => {
    return () => {
      window.clearTimeout(errorTimerId.current)
    }
  }, [])
  const addNewTemplate = () => {
    if (submitting) return
    if (featureFlags.templateLimit && tier === 'personal') {
      displayUpgradeDetails()
      return
    }
    if (reflectTemplates.length >= Threshold.MAX_RETRO_TEAM_TEMPLATES) {
      onError(new Error('You may only have 20 templates per team. Please remove one first.'))
      errorTimerId.current = window.setTimeout(() => {
        onCompleted()
      }, 8000)
      return
    }
    if (reflectTemplates.find((template) => template.name === '*New Template')) {
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

  const containsNewTemplate = reflectTemplates.find((template) => template.name === '*New Template')

  if (reflectTemplates.length > Threshold.MAX_RETRO_TEAM_TEMPLATES || containsNewTemplate)
    return null
  return (
    <div>
      {error && <ErrorLine>{error.message}</ErrorLine>}
      <AddRetroTemplateLink palette='blue' onClick={addNewTemplate} waiting={submitting}>
        {`Create New Template ${featureFlags.templateLimit && tier === 'personal' && '🔒'}`}
      </AddRetroTemplateLink>
    </div>
  )
}

export default AddNewReflectTemplate

import React from 'react'
import AddToGitHubMenuItem from './AddToGitHubMenuItem'
import AddToJiraMenuItem from './AddToJiraMenuItem'
import LoadingComponent from './LoadingComponent/LoadingComponent'
import Menu from './Menu'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV3'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
  label?: string
}

const NarrowMenu = styled(Menu)({
  width: 250
})

const Label = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  fontStyle: 'italic',
  padding: 8
})

const TaskFooterIntegrateMenuSignup = (props: Props) => {
  const {menuProps, mutationProps, teamId, label} = props
  const {submitting} = mutationProps
  if (submitting) return <LoadingComponent spinnerSize={24} height={24} showAfter={0} width={200} />
  return (
    <NarrowMenu ariaLabel={'Integrate with a Service'} {...menuProps}>
      {label && <Label>{label}</Label>}
      <AddToGitHubMenuItem mutationProps={mutationProps} teamId={teamId} />
      <AddToJiraMenuItem mutationProps={mutationProps} teamId={teamId} />
    </NarrowMenu>
  )
}

export default TaskFooterIntegrateMenuSignup

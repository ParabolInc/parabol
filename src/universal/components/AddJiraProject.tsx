import {AddJiraProject_team} from '__generated__/AddJiraProject_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import Icon from 'universal/components/Icon'
import {ModalAnchor} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import {PALETTE} from 'universal/styles/paletteV2'
import {AccessibleResource} from 'universal/utils/AtlassianClientManager'
import lazyPreload from 'universal/utils/lazyPreload'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

const DownArrow = styled(Icon)({
  marginLeft: 16
})

const JiraAvailableProjectsMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'JiraAvailableProjectsMenu' */ 'universal/components/JiraAvailableProjectsMenu')
)

const AddProjectButton = styled(FlatButton)({
  background: '#fff',
  borderColor: PALETTE.BORDER.LIGHT,
  borderWidth: 1,
  display: 'flex',
  fontSize: 14,
  fontWeight: 600,
  justifyContent: 'flex-end',
  marginTop: 16
})

const originAnchor: ModalAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor: ModalAnchor = {
  vertical: 'top',
  horizontal: 'right'
}

interface Props extends WithMutationProps {
  accessToken: string
  sites: AccessibleResource[]
  team: AddJiraProject_team
}

const StyledError = styled('div')({
  color: PALETTE.ERROR.MAIN,
  fontSize: 14,
  fontWeight: 600,
  marginTop: 8,
  textAlign: 'center'
})

const AddJiraProject = (props: Props) => {
  const {accessToken, sites, team, onError, onCompleted, submitMutation, error} = props
  const {togglePortal, originRef, menuPortal, closePortal} = useMenu(originAnchor, targetAnchor)
  return (
    // the portal must be opened outside of the button otherwise react bubbles the event (like mousedown) up to the button
    <>
      {menuPortal(
        <JiraAvailableProjectsMenu
          accessToken={accessToken}
          sites={sites}
          onError={onError}
          onCompleted={onCompleted}
          submitMutation={submitMutation}
          team={team}
          closePortal={closePortal}
          originRef={originRef}
        />
      )}
      <AddProjectButton
        onMouseDown={togglePortal}
        innerRef={originRef}
        disabled={sites.length < 1}
        onClick={() => onError(/* Remove any error*/)}
        onMouseEnter={JiraAvailableProjectsMenu.preload}
      >
        Add Project
        <DownArrow>expand_more</DownArrow>
      </AddProjectButton>
      {error && <StyledError>{error}</StyledError>}
    </>
  )
}

export default createFragmentContainer(
  withMutationProps(AddJiraProject),
  graphql`
    fragment AddJiraProject_team on Team {
      ...JiraAvailableProjectsMenu_team
    }
  `
)

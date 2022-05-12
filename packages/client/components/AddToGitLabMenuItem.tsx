import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {useFragment} from 'react-relay'
import GitLabClientManager from '~/utils/GitLabClientManager'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps, {MenuMutationProps} from '../hooks/useMutationProps'
import {ICON_SIZE} from '../styles/typographyV2'
import {AddToGitLabMenuItem_GitLabIntegration$key} from '../__generated__/AddToGitLabMenuItem_GitLabIntegration.graphql'
import GitLabSVG from './GitLabSVG'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
  gitlabRef: AddToGitLabMenuItem_GitLabIntegration$key
}

const MenuItemIcon = styled(MenuItemComponentAvatar)({
  '& svg': {
    display: 'block',
    height: ICON_SIZE.MD18,
    width: ICON_SIZE.MD18
  }
})

const AddToGitLabMenuItem = forwardRef((props: Props, ref) => {
  const {teamId, gitlabRef} = props
  const mutationProps = useMutationProps()
  const gitlab = useFragment(
    graphql`
      fragment AddToGitLabMenuItem_GitLabIntegration on GitLabIntegration {
        cloudProvider {
          id
          clientId
          serverBaseUrl
        }
      }
    `,
    gitlabRef
  )
  const atmosphere = useAtmosphere()
  const {cloudProvider} = gitlab
  if (!cloudProvider) return null
  const {id: providerId, clientId, serverBaseUrl} = cloudProvider
  const openOAuth = () => {
    GitLabClientManager.openOAuth(
      atmosphere,
      providerId,
      clientId,
      serverBaseUrl,
      teamId,
      mutationProps
    )
  }
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemIcon>
            <GitLabSVG />
          </MenuItemIcon>
          {'Add GitLab integration'}
        </MenuItemLabel>
      }
      onClick={openOAuth}
    />
  )
})

export default AddToGitLabMenuItem

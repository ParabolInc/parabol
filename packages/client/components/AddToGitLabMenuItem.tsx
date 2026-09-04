import graphql from 'babel-plugin-relay/macro'
import {forwardRef} from 'react'
import {useFragment} from 'react-relay'
import GitLabClientManager from '~/utils/GitLabClientManager'
import type {AddToGitLabMenuItem_GitLabIntegration$key} from '../__generated__/AddToGitLabMenuItem_GitLabIntegration.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps, {type MenuMutationProps} from '../hooks/useMutationProps'
import {MenuItem} from '../ui/Menu/MenuItem'
import GitLabSVG from './GitLabSVG'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
  gitlabRef: AddToGitLabMenuItem_GitLabIntegration$key
}

const AddToGitLabMenuItem = forwardRef<HTMLDivElement, Props>((props, ref) => {
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
    <MenuItem ref={ref} onClick={openOAuth}>
      <MenuItemComponentAvatar className='[&_svg]:block [&_svg]:h-[18px] [&_svg]:w-[18px]'>
        <GitLabSVG />
      </MenuItemComponentAvatar>
      {'Add GitLab integration'}
    </MenuItem>
  )
})

export default AddToGitLabMenuItem

import graphql from 'babel-plugin-relay/macro'
import {forwardRef} from 'react'
import {useFragment} from 'react-relay'
import GitLabClientManager from '~/utils/GitLabClientManager'
import type {AddToGitLabMenuItem_GitLabIntegration$key} from '../__generated__/AddToGitLabMenuItem_GitLabIntegration.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps, {type MenuMutationProps} from '../hooks/useMutationProps'
import GitLabSVG from './GitLabSVG'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
  gitlabRef: AddToGitLabMenuItem_GitLabIntegration$key
}

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
          <MenuItemComponentAvatar className='[&_svg]:block [&_svg]:h-[18px] [&_svg]:w-[18px]'>
            <GitLabSVG />
          </MenuItemComponentAvatar>
          {'Add GitLab integration'}
        </MenuItemLabel>
      }
      onClick={openOAuth}
    />
  )
})

export default AddToGitLabMenuItem

import {forwardRef} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import JiraSVG from './JiraSVG'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
}

const AddToJiraMenuItem = forwardRef((props: Props, ref) => {
  const {mutationProps, teamId} = props
  const atmosphere = useAtmosphere()
  const onClick = () => {
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  if (!AtlassianClientManager.isAvailable) return null
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemComponentAvatar className='[&_svg]:block [&_svg]:h-[18px] [&_svg]:w-[18px]'>
            <JiraSVG />
          </MenuItemComponentAvatar>
          {'Add Jira integration'}
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default AddToJiraMenuItem

import React, {forwardRef} from 'react'
import JiraSVG from 'universal/components/JiraSVG'
import MenuItem from 'universal/components/MenuItem'
import MenuItemComponentAvatar from 'universal/components/MenuItemComponentAvatar'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {IntegrationServiceEnum} from 'universal/types/graphql'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithMutationProps {
  teamId: string
}

const AddToJiraMenuItem = forwardRef((props: Props, ref) => {
  const {teamId, submitting, submitMutation, onError, onCompleted} = props
  const atmosphere = useAtmosphere()
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemComponentAvatar>
            <JiraSVG />
          </MenuItemComponentAvatar>
          {'Add Jira integration'}
        </MenuItemLabel>
      }
      onClick={handleOpenOAuth({
        name: IntegrationServiceEnum.atlassian,
        submitting,
        submitMutation,
        atmosphere,
        onError,
        onCompleted,
        teamId
      })}
    />
  )
})

export default withMutationProps(AddToJiraMenuItem)

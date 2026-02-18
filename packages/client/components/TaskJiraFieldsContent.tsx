import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import SetJiraDisplayFieldIdsMutation from '~/mutations/SetJiraDisplayFieldIdsMutation'
import {MenuItemCheckbox} from '~/ui/Menu/MenuItemCheckbox'
import type {TaskJiraFieldsContent_task$key} from '../__generated__/TaskJiraFieldsContent_task.graphql'

interface Props {
  taskRef: TaskJiraFieldsContent_task$key
  onAddJiraField?: () => void
}
export const TaskJiraFieldsContent = (props: Props) => {
  const {taskRef, onAddJiraField} = props
  const atmosphere = useAtmosphere()
  const task = useFragment(
    graphql`
  fragment TaskJiraFieldsContent_task on Task {
    integration {
      ... on JiraIssue {
        extraFields {
          fieldId
          fieldName
        }
      }
    }
    team {
      id
      jiraDisplayFieldIds
    }
  }`,
    taskRef
  )
  const {integration, team} = task
  const {id: teamId, jiraDisplayFieldIds} = team
  const extraFields = integration?.extraFields || []
  return (
    <>
      {extraFields?.map((field) => {
        const checked = jiraDisplayFieldIds?.includes(field.fieldId)
        return (
          <MenuItemCheckbox
            key={field.fieldId}
            checked={checked}
            onClick={() => {
              const nextJiraDisplayFieldIds = checked
                ? jiraDisplayFieldIds?.filter((id) => id !== field.fieldId)
                : [...(jiraDisplayFieldIds ?? []), field.fieldId]
              SetJiraDisplayFieldIdsMutation(
                atmosphere,
                {
                  teamId,
                  jiraDisplayFieldIds: nextJiraDisplayFieldIds!
                },
                {
                  onError: () => {},
                  onCompleted: () => {
                    if (!checked) {
                      onAddJiraField?.()
                    }
                  }
                }
              )
            }}
          >
            {field.fieldName}
          </MenuItemCheckbox>
        )
      })}
    </>
  )
}

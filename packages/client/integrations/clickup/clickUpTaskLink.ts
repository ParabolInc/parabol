import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import type {clickUpTaskLink_task$key} from '../../__generated__/clickUpTaskLink_task.graphql'
import type {TaskLinkCapability} from '../platform/ClientIntegrationDefinition'
import getClickUpTaskLinkTitle from './getClickUpTaskLinkTitle'

const clickUpTaskLink: TaskLinkCapability = {
  getDetails: ({clickUpTaskLink_task}) => {
    if (!clickUpTaskLink_task) return null
    const task = readInlineData<clickUpTaskLink_task$key>(
      graphql`
        fragment clickUpTaskLink_task on ClickUpTask @inline {
          taskId
          customId
          listName
          folderName
          clickUpUrl: url
          clickUpStatus: status {
            name
          }
        }
      `,
      clickUpTaskLink_task
    )
    return {
      href: task.clickUpUrl,
      label: `Task ${task.customId ?? task.taskId}`,
      title: getClickUpTaskLinkTitle(task),
      status: task.clickUpStatus?.name ?? null
    }
  }
}

export default clickUpTaskLink

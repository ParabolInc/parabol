interface ClickUpTaskLinkFields {
  taskId: string
  customId: string | null | undefined
  listName: string
  folderName: string | null | undefined
}

const getClickUpTaskLinkTitle = ({taskId, customId, listName, folderName}: ClickUpTaskLinkFields) =>
  `ClickUp task ${customId ?? taskId} in ${folderName ? `${folderName} / ${listName}` : listName}`

export default getClickUpTaskLinkTitle

import getClickUpTaskLinkTitle from '../getClickUpTaskLinkTitle'

describe('getClickUpTaskLinkTitle', () => {
  it('names the custom id and the Folder / List path', () => {
    expect(
      getClickUpTaskLinkTitle({
        taskId: '86bd03p5u',
        customId: 'ENG-12',
        listName: 'Sprint 4',
        folderName: 'Engineering'
      })
    ).toBe('ClickUp task ENG-12 in Engineering / Sprint 4')
  })

  it('falls back to the task id and the List alone for a folderless task', () => {
    expect(
      getClickUpTaskLinkTitle({
        taskId: '86bd03p5u',
        customId: null,
        listName: 'Inbox',
        folderName: null
      })
    ).toBe('ClickUp task 86bd03p5u in Inbox')
  })
})

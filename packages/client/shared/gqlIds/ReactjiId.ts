const ReactjiId = {
  join: (reactableId: string, reactjiName: string) => `${reactableId}:${reactjiName}`,
  split: (id: string) => {
    const splitIndex = id.lastIndexOf(':')
    const name = splitIndex !== -1 ? id.slice(splitIndex + 1) : ''
    const reactableId = splitIndex !== -1 ? id.slice(0, splitIndex) : ''
    return {reactableId, name}
  }
}

export default ReactjiId

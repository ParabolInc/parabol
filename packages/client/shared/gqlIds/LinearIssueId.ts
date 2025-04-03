const LinearIssueId = {
  join: (providerId: string, id: string) => `${providerId}::${id}`,
  split: (integrationHash: string) => {
    const [providerId, id] = integrationHash.split('::') as [string, string]
    return {
      providerId,
      id
    }
  }
}

export default LinearIssueId

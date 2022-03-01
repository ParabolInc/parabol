const JiraDimensionFieldId = {
  join: (cloudId: string, dimensionName: string, fieldId: string) =>
    `${cloudId}:${dimensionName.replace(/\s/g, '¶')}:${fieldId}`,
  split: (id: string) => {
    const [cloudId, dimensionName, fieldId] = id.split(':') as [string, string, string]
    return {cloudId, dimensionName: dimensionName.replace(/¶/g, ' '), fieldId}
  }
}

export default JiraDimensionFieldId

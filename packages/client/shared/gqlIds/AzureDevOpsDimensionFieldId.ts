const AzureDevOpsDimensionFieldId = {
  join: (instanceId: string, dimensionName: string, fieldId: string) =>
    // replaces whitespace characters with '¶'
    `${instanceId}:${dimensionName.replace(/\s/g, '¶')}:${fieldId}`,
  split: (id: string) => {
    const [instanceId, dimensionName, fieldId] = id.split(':') as [string, string, string]
    // replaces '¶' characters with whitespace
    return {instanceId, dimensionName: dimensionName.replace(/¶/g, ' '), fieldId}
  }
}

export default AzureDevOpsDimensionFieldId

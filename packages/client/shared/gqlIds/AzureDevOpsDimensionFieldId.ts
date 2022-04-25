const AzureDevOpsDimensionFieldId = {
  join: (instanceId: string, dimensionName: string, fieldId: string) =>
    `${instanceId}:${dimensionName.replace(/\s/g, '¶')}:${fieldId}`,
  split: (id: string) => {
    const [instanceId, dimensionName, fieldId] = id.split(':') as [string, string, string]
    return {instanceId, dimensionName: dimensionName.replace(/¶/g, ' '), fieldId}
  }
}

export default AzureDevOpsDimensionFieldId

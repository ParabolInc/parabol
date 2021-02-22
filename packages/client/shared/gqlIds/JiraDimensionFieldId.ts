
const JiraDimensionFieldId = {
  join: (cloudId: string, dimensionName: string, fieldId: string) => `${cloudId}:${dimensionName.replace(/\s/g, '_')}:${fieldId}`,
  split: (id: string) => {
    const [cloudId, dimensionName, fieldId] = id.split(':')
    return {cloudId, dimensionName: dimensionName.replace(/_/g, ' '), fieldId}
  }
}

export default JiraDimensionFieldId

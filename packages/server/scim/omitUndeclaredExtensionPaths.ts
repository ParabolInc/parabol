import SCIMMY from 'scimmy'

// scimmy rejects a whole PatchOp over one attribute of an undeclared schema extension, while POST
// and PUT drop such attributes. Declaring the enterprise extension wouldn't help: Entra ID sends
// manager, a complex attribute, as a bare id string
export const omitUndeclaredExtensionPaths = (
  operations: SCIMMY.Messages.PatchOp.PatchOpOperation[],
  schema: SCIMMY.Types.SchemaDefinition
) => {
  const declaredSchemaIds = [
    schema.id,
    ...schema.attributes
      .filter((attribute) => attribute instanceof SCIMMY.Types.SchemaDefinition)
      .map(({id}) => id)
  ].map((id) => id.toLowerCase())
  const isUndeclared = (path: string) => {
    const lowerPath = path.toLowerCase()
    return (
      lowerPath.startsWith('urn:') &&
      !declaredSchemaIds.some((id) => lowerPath === id || lowerPath.startsWith(`${id}:`))
    )
  }

  return operations.flatMap((operation) => {
    const {path, value} = operation
    if (path !== undefined) return isUndeclared(path) ? [] : [operation]
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return [operation]
    const entries = Object.entries(value)
    const declaredEntries = entries.filter(([key]) => !isUndeclared(key))
    if (declaredEntries.length === entries.length) return [operation]
    return declaredEntries.length > 0
      ? [{...operation, value: Object.fromEntries(declaredEntries)}]
      : []
  })
}

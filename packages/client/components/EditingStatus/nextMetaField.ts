export type TaskMetaField = 'createdAt' | 'updatedAt' | 'createdIn'

const nextMetaField = (current: TaskMetaField, hasRetro: boolean): TaskMetaField => {
  if (!hasRetro) {
    return current === 'createdAt' ? 'updatedAt' : 'createdAt'
  }
  if (current === 'createdAt') return 'updatedAt'
  if (current === 'updatedAt') return 'createdIn'
  return 'createdAt'
}

export default nextMetaField

import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'

const removeEmptyReflectionGroup = async (
  reflectionGroupId: string,
  oldReflectionGroupId: string,
  dataLoader: DataLoaderInstance
) => {
  const pg = getKysely()
  if (!reflectionGroupId) return false
  const reflectionsInGroup = await dataLoader
    .get('retroReflectionsByGroupId')
    .load(oldReflectionGroupId)

  if (reflectionsInGroup.length > 0) return

  return pg
    .updateTable('RetroReflectionGroup')
    .set({isActive: false})
    .where('id', '=', oldReflectionGroupId)
    .execute()
}

export default removeEmptyReflectionGroup

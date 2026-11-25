import {CipherId} from '../../../../utils/CipherId'
import type {ResourceGrants} from '../../ResourceGrants'

const BATCH_SIZE = 20

export const getReachablePageCodes = async (codes: unknown[], resourceGrants: ResourceGrants) => {
  const pageCodes = [...new Set(codes)].filter((code): code is number => Number.isInteger(code))
  const reachablePageCodes: number[] = []
  for (let start = 0; start < pageCodes.length; start += BATCH_SIZE) {
    const batch = pageCodes.slice(start, start + BATCH_SIZE)
    const isReachable = await Promise.all(
      batch.map((code) => resourceGrants.hasPage(CipherId.decrypt(code)))
    )
    reachablePageCodes.push(...batch.filter((_code, idx) => isReachable[idx]))
  }
  return reachablePageCodes
}

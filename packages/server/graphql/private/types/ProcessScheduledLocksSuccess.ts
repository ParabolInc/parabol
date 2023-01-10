import isValid from '../../isValid'
import {ProcessScheduledLocksSuccessResolvers} from '../../private/resolverTypes'

export type ProcessScheduledLocksSuccessSource = {
  lockedOrgIds: string[]
  warnedOrgIds: string[]
}

const ProcessScheduledLocksSuccess: ProcessScheduledLocksSuccessResolvers = {
  lockedOrgs: async ({lockedOrgIds}, _args, {dataLoader}) => {
    const lockedOrgs = (await dataLoader.get('organizations').loadMany(lockedOrgIds)).filter(
      isValid
    )
    return lockedOrgs
  },
  warnedOrgs: async ({warnedOrgIds}, _args, {dataLoader}) => {
    const warnedOrgs = (await dataLoader.get('organizations').loadMany(warnedOrgIds)).filter(
      isValid
    )
    return warnedOrgs
  }
}

export default ProcessScheduledLocksSuccess

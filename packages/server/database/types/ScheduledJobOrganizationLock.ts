import ScheduledJob from './ScheduledJob'

export default class ScheduledJobOrganizationLock extends ScheduledJob {
  constructor(public runAt: Date, public orgId: string) {
    super('LOCK_ORGANIZATION', runAt)
  }
}

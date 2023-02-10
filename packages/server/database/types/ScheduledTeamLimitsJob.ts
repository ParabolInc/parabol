import ScheduledJob, {ScheduledJobType} from './ScheduledJob'

export default class ScheduledTeamLimitsJob extends ScheduledJob {
  constructor(public runAt: Date, public orgId: string, public type: ScheduledJobType) {
    super(type, runAt)
  }
}

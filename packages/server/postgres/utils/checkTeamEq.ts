import Team from '../../database/types/Team'
import {
  getTeamsByIdQuery,
  IGetTeamsByIdQueryResult
} from '../../postgres/queries/generated/getTeamsByIdQuery'
import getRethink from '../../database/rethinkDriver'
import getPg from '../../postgres/getPg'
import lodash from 'lodash'
import {
  IAlwaysDefinedFieldsCustomResolvers,
  IMaybeUndefinedFieldsDefaultValues,
  IError,
  AddNeFieldToErrors,
  addNeFieldToErrors,
  CustomResolver
} from './checkEqBase'

type IErrorTeam = IError<Team, IGetTeamsByIdQueryResult>
const addNeFieldToErrorsForTeam = addNeFieldToErrors as AddNeFieldToErrors<
  Team,
  IGetTeamsByIdQueryResult
>

const namesAreEqual: CustomResolver = (rethinkName, pgName) =>
  lodash.isEqual(rethinkName, pgName) || rethinkName.slice(0, 100) === pgName

const alwaysDefinedFieldsCustomResolvers = {
  name: namesAreEqual,
  createdAt: undefined,
  isArchived: undefined,
  isPaid: undefined,
  tier: undefined,
  orgId: undefined,
  updatedAt: undefined
} as IAlwaysDefinedFieldsCustomResolvers<Team>

const maybeUndefinedFieldsDefaultValues = {
  jiraDimensionFields: [],
  lastMeetingType: 'retrospective',
  createdBy: null,
  isOnboardTeam: false
} as IMaybeUndefinedFieldsDefaultValues<Team>

const checkPair = async (
  rethinkTeam: Team,
  pgTeam: IGetTeamsByIdQueryResult,
  errors: IErrorTeam
) => {
  for (const [f, customResolver] of Object.entries(alwaysDefinedFieldsCustomResolvers)) {
    const [rethinkValue, pgValue] = [rethinkTeam[f], pgTeam[f]]
    if (!lodash.isEqualWith(rethinkValue, pgValue, customResolver)) {
      addNeFieldToErrorsForTeam(errors, f, rethinkTeam, pgTeam)
    }
  }
  for (const [f, defaultValue] of Object.entries(maybeUndefinedFieldsDefaultValues)) {
    const [rethinkValue, pgValue] = [rethinkTeam[f], pgTeam[f]]
    if (!lodash.isUndefined(rethinkValue)) {
      if (!lodash.isEqual(rethinkValue, pgValue)) {
        addNeFieldToErrorsForTeam(errors, f, rethinkTeam, pgTeam)
      }
    } else {
      if (!lodash.isEqual(pgValue, defaultValue)) {
        addNeFieldToErrorsForTeam(errors, f, rethinkTeam, pgTeam)
      }
    }
  }
}

const checkTeamEq = async (): Promise<IErrorTeam> => {
  const errors = {}
  const batchSize = 3000
  const r = await getRethink()

  for (let i = 0; i < 1e5; i++) {
    console.log(i)
    const offset = batchSize * i
    const rethinkTeams = await r
      .db('actionProduction')
      .table('Team')
      .orderBy('updatedAt', {index: 'updatedAt'})
      .skip(offset)
      .limit(batchSize)
      .run()
    if (!rethinkTeams.length) {
      break
    }

    const teamIds = rethinkTeams.map((t) => t.id)
    const pgTeams = await getTeamsByIdQuery.run({ids: teamIds}, getPg())
    const pgTeamsById = {} as {
      [key: string]: IGetTeamsByIdQueryResult
    }
    pgTeams.forEach((pgTeam) => {
      pgTeamsById[pgTeam.id] = pgTeam
    })

    for (const rethinkTeam of rethinkTeams) {
      const pgTeam = pgTeamsById[rethinkTeam.id]
      if (!pgTeam) {
        errors[rethinkTeam.id] = {
          error: 'No pg team found for rethink team'
        }
        continue
      }
      await checkPair(rethinkTeam, pgTeam, errors)
    }
  }

  return errors
}

export default checkTeamEq

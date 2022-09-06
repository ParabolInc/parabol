import * as crypto from 'crypto'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as _stringify from 'fast-json-stable-stringify'
import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'
import {Client} from 'pg'
import {r, RValue} from 'rethinkdb-ts'
import {parse} from 'url'
import MeetingPoker from '../../database/types/MeetingPoker'
import TemplateDimension from '../../database/types/TemplateDimension'
import TemplateScale from '../../database/types/TemplateScale'
import {insertTemplateRefQuery, insertTemplateScaleRefQuery} from '../generatedMigrationHelpers'
import getPgConfig from '../getPgConfig'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(): Promise<void> {
  const u = parse(process.env.RETHINKDB_URL!)
  const config = {
    host: u.hostname || '',
    port: parseInt(u.port!, 10),
    db: u.path!.split('/')[1]
  }
  await r.connectPool(config)

  const stringify = (_stringify as any).default || _stringify

  const getHashAndJSON = (obj: any) => {
    const str = stringify(obj)
    const checksum = crypto.createHash('md5')
    checksum.update(str)
    const id = checksum.digest('base64')
    return {id, str}
  }
  const client = new Client(getPgConfig())
  await client.connect()

  const meetings = (await r
    .table('NewMeeting')
    .filter({meetingType: 'poker' as any})
    .run()) as unknown as MeetingPoker[]
  const templateIds = meetings.map(({templateId}) => templateId)
  const uniqueTemplateIds = Array.from(new Set(templateIds))
  const dimensionsByTemplateId = (await r
    .table('TemplateDimension')
    .getAll(r.args(uniqueTemplateIds), {index: 'templateId'})
    .merge((d: RValue) => ({
      scale: r.table('TemplateScale').get(d('scaleId'))
    }))
    .orderBy('sortOrder')
    .group('templateId')
    .ungroup()
    .merge((row: RValue) => ({
      name: r.table('MeetingTemplate').get(row('group'))('name'),
      id: row('group'),
      dimensions: row('reduction')
    }))
    .run()) as {
    id: string
    name: string
    dimensions: (TemplateDimension & {scale: TemplateScale})[]
  }[]

  const uniqueScaleIdSet = new Set<string>()
  const uniqueScales = [] as TemplateScale[]
  dimensionsByTemplateId.forEach((group) => {
    const {dimensions} = group
    dimensions.forEach((dimension) => {
      const {scaleId, scale} = dimension
      if (uniqueScaleIdSet.has(scaleId)) return
      uniqueScaleIdSet.add(scaleId)
      uniqueScales.push(scale)
    })
  })
  const templateScales = uniqueScales.map(({name, values}) => {
    const scale = {name, values}
    const {id, str} = getHashAndJSON(scale)
    return {id, scale: str}
  })

  const templateIdToTemplateRefId = {} as Record<string, string>
  const dimensionIdToDimensionRefIdx = {} as Record<string, number>

  // Handle PG updates
  if (templateScales.length) {
    await insertTemplateScaleRefQuery.run({templateScales}, client)
  }

  await Promise.all(
    dimensionsByTemplateId.map((group) => {
      const {id, name, dimensions} = group
      const templateRef = {
        name,
        dimensions: dimensions.map((dimension, idx) => {
          const {id: dimensionId, name, scaleId} = dimension
          // side effects!
          dimensionIdToDimensionRefIdx[dimensionId] = idx

          const scaleIdx = uniqueScales.findIndex((scale) => scale.id === scaleId)
          const templateScale = templateScales[scaleIdx]!
          const {id: scaleRefId} = templateScale
          return {
            name,
            scaleRefId
          }
        })
      }
      const {id: templateRefId, str: templateRefStr} = getHashAndJSON(templateRef)
      // side effects!
      templateIdToTemplateRefId[id] = templateRefId
      const ref = {id: templateRefId, template: templateRefStr}
      return insertTemplateRefQuery.run({ref}, client)
    })
  )

  // Handle RethinkDB Updates
  // wipe the jira dimension fields since we can no longer use dimensionId
  if (await r.tableList().contains('Team').run()) {
    await r
      .table('Team')
      .filter((row: RValue) => row('jiraDimensionFields').default(null).ne(null))
      .update({jiraDimensionFields: []})
      .run()
  }

  // add a templateRefId to each meeting
  await r(templateIdToTemplateRefId)
    .do((lookup: RValue) => {
      return r
        .table('NewMeeting')
        .filter({meetingType: 'poker'})
        .update((meeting: RValue) => ({
          templateRefId: lookup(meeting('templateId'))
        }))
    })
    .run()
  const mapIf = (rArr: any, test: any, f: any) => {
    return rArr.map((x: any) => r.branch(test(x), f(x), x))
  }
  await r(dimensionIdToDimensionRefIdx)
    .do((lookup: any) => {
      return r
        .table('NewMeeting')
        .filter({meetingType: 'poker'})
        .update((meeting: RValue) => ({
          phases: mapIf(
            meeting('phases'),
            (phase: RValue) => phase('phaseType').eq('ESTIMATE'),
            (estimatePhase: RValue) =>
              estimatePhase.merge({
                stages: estimatePhase('stages').map((stage: any) =>
                  stage.merge({
                    dimensionRefIdx: lookup(stage('dimensionId'))
                  })
                )
              })
          )
        }))
    })
    .run()

  await client.end()
  await r.getPoolMaster()?.drain()
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.sql(`
    DELETE FROM "TemplateRef";
    DELETE FROM "TemplateScaleRef";
  `)
}

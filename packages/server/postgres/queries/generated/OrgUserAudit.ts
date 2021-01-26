/** Types generated for queries found in "packages/server/postgres/queries/src/OrgUserAudit.sql" */
import {PreparedQuery} from '@pgtyped/query'

/** 'InsertOrgUserAudit' parameters type */
export interface IInsertOrgUserAuditParams {
  auditRows: Array<{
    orgId: string | null | void
    userId: string | null | void
    eventDate: Date | null | void
    eventType: number | null | void
  }>
}

/** 'InsertOrgUserAudit' return type */
export type IInsertOrgUserAuditResult = void

/** 'InsertOrgUserAudit' query type */
export interface IInsertOrgUserAuditQuery {
  params: IInsertOrgUserAuditParams
  result: IInsertOrgUserAuditResult
}

const insertOrgUserAuditIR: any = {
  name: 'insertOrgUserAudit',
  params: [
    {
      name: 'auditRows',
      codeRefs: {
        defined: {a: 41, b: 49, line: 3, col: 9},
        used: [{a: 200, b: 208, line: 10, col: 10}]
      },
      transform: {type: 'pick_array_spread', keys: ['orgId', 'userId', 'eventDate', 'eventType']}
    }
  ],
  usedParamSet: {auditRows: true},
  statement: {
    body:
      'INSERT INTO "OrganizationUserAudit" (\n  "orgId",\n  "userId",\n  "eventDate",\n  "eventType"\n) VALUES :auditRows',
    loc: {a: 100, b: 208, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "OrganizationUserAudit" (
 *   "orgId",
 *   "userId",
 *   "eventDate",
 *   "eventType"
 * ) VALUES :auditRows
 * ```
 */
export const insertOrgUserAudit = new PreparedQuery<
  IInsertOrgUserAuditParams,
  IInsertOrgUserAuditResult
>(insertOrgUserAuditIR)

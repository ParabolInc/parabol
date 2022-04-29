/** Types generated for queries found in "packages/server/postgres/queries/src/getApprovedOrganizationDomainsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetApprovedOrganizationDomainsQuery' parameters type */
export interface IGetApprovedOrganizationDomainsQueryParams {
  orgId: string | null | void;
}

/** 'GetApprovedOrganizationDomainsQuery' return type */
export interface IGetApprovedOrganizationDomainsQueryResult {
  id: number;
  createdAt: Date;
  removedAt: Date | null;
  domain: string | null;
  orgId: string;
  addedByUserId: string;
}

/** 'GetApprovedOrganizationDomainsQuery' query type */
export interface IGetApprovedOrganizationDomainsQueryQuery {
  params: IGetApprovedOrganizationDomainsQueryParams;
  result: IGetApprovedOrganizationDomainsQueryResult;
}

const getApprovedOrganizationDomainsQueryIR: any = {"name":"getApprovedOrganizationDomainsQuery","params":[{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":110,"b":114,"line":5,"col":17}]}}],"usedParamSet":{"orgId":true},"statement":{"body":"SELECT * from \"OrganizationApprovedDomain\"\nWHERE \"orgId\" = :orgId AND \"removedAt\" IS NULL","loc":{"a":50,"b":138,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "OrganizationApprovedDomain"
 * WHERE "orgId" = :orgId AND "removedAt" IS NULL
 * ```
 */
export const getApprovedOrganizationDomainsQuery = new PreparedQuery<IGetApprovedOrganizationDomainsQueryParams,IGetApprovedOrganizationDomainsQueryResult>(getApprovedOrganizationDomainsQueryIR);



/** Types generated for queries found in "packages/server/postgres/queries/src/removeTeamResponseReactjiQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'RemoveTeamResponseReactji' parameters type */
export interface IRemoveTeamResponseReactjiParams {
  reactji: {
    shortname: string | null | void,
    userid: string | null | void
  };
  id: number | null | void;
}

/** 'RemoveTeamResponseReactji' return type */
export type IRemoveTeamResponseReactjiResult = void;

/** 'RemoveTeamResponseReactji' query type */
export interface IRemoveTeamResponseReactjiQuery {
  params: IRemoveTeamResponseReactjiParams;
  result: IRemoveTeamResponseReactjiResult;
}

const removeTeamResponseReactjiIR: any = {"name":"removeTeamResponseReactji","params":[{"name":"reactji","codeRefs":{"defined":{"a":46,"b":52,"line":3,"col":9},"used":[{"a":154,"b":160,"line":6,"col":42}]},"transform":{"type":"pick_tuple","keys":["shortname","userid"]}},{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":187,"b":188,"line":7,"col":12}]}}],"usedParamSet":{"reactji":true,"id":true},"statement":{"body":"UPDATE \"TeamPromptResponse\" SET\n  \"reactjis\" = array_remove(\"reactjis\", (:reactji)::\"Reactji\")\nWHERE id = :id","loc":{"a":80,"b":188,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "TeamPromptResponse" SET
 *   "reactjis" = array_remove("reactjis", (:reactji)::"Reactji")
 * WHERE id = :id
 * ```
 */
export const removeTeamResponseReactji = new PreparedQuery<IRemoveTeamResponseReactjiParams,IRemoveTeamResponseReactjiResult>(removeTeamResponseReactjiIR);



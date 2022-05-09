/** Types generated for queries found in "packages/server/postgres/queries/src/appendTeamResponseReactjiQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'AppendTeamResponseReactji' parameters type */
export interface IAppendTeamResponseReactjiParams {
  reactji: {
    shortname: string | null | void,
    userid: string | null | void
  };
  id: string | null | void;
}

/** 'AppendTeamResponseReactji' return type */
export type IAppendTeamResponseReactjiResult = void;

/** 'AppendTeamResponseReactji' query type */
export interface IAppendTeamResponseReactjiQuery {
  params: IAppendTeamResponseReactjiParams;
  result: IAppendTeamResponseReactjiResult;
}

const appendTeamResponseReactjiIR: any = {"name":"appendTeamResponseReactji","params":[{"name":"reactji","codeRefs":{"defined":{"a":46,"b":52,"line":3,"col":9},"used":[{"a":157,"b":163,"line":6,"col":45}]},"transform":{"type":"pick_tuple","keys":["shortname","userid"]}},{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":223,"b":224,"line":7,"col":45}]}}],"usedParamSet":{"reactji":true,"id":true},"statement":{"body":"UPDATE \"TeamPromptResponse\" SET\n  \"reactjis\" = arr_append_uniq(\"reactjis\", (:reactji)::\"Reactji\")\nWHERE CONCAT('teamPromptResponse:', \"id\") = :id","loc":{"a":80,"b":224,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "TeamPromptResponse" SET
 *   "reactjis" = arr_append_uniq("reactjis", (:reactji)::"Reactji")
 * WHERE CONCAT('teamPromptResponse:', "id") = :id
 * ```
 */
export const appendTeamResponseReactji = new PreparedQuery<IAppendTeamResponseReactjiParams,IAppendTeamResponseReactjiResult>(appendTeamResponseReactjiIR);



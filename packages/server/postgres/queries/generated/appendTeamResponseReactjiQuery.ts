/** Types generated for queries found in "packages/server/postgres/queries/src/appendTeamResponseReactjiQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'AppendTeamResponseReactji' parameters type */
export interface IAppendTeamResponseReactjiParams {
  reactji: {
    shortName: string | null | void,
    userId: string | null | void
  };
  id: number | null | void;
}

/** 'AppendTeamResponseReactji' return type */
export type IAppendTeamResponseReactjiResult = void;

/** 'AppendTeamResponseReactji' query type */
export interface IAppendTeamResponseReactjiQuery {
  params: IAppendTeamResponseReactjiParams;
  result: IAppendTeamResponseReactjiResult;
}

const appendTeamResponseReactjiIR: any = {"name":"appendTeamResponseReactji","params":[{"name":"reactji","codeRefs":{"defined":{"a":46,"b":52,"line":3,"col":9},"used":[{"a":143,"b":149,"line":7,"col":11},{"a":233,"b":239,"line":8,"col":36}]},"transform":{"type":"pick_tuple","keys":["shortName","userId"]}},{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":272,"b":273,"line":10,"col":12}]}}],"usedParamSet":{"reactji":true,"id":true},"statement":{"body":"UPDATE \"TeamPromptResponse\" SET\n  \"reactjis\" = CASE\n    WHEN (:reactji)::\"Reactji\" = ANY(\"reactjis\") THEN \"reactjis\"\n    ELSE array_append(\"reactjis\", (:reactji)::\"Reactji\")\n  END\nWHERE id = :id","loc":{"a":80,"b":273,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "TeamPromptResponse" SET
 *   "reactjis" = CASE
 *     WHEN (:reactji)::"Reactji" = ANY("reactjis") THEN "reactjis"
 *     ELSE array_append("reactjis", (:reactji)::"Reactji")
 *   END
 * WHERE id = :id
 * ```
 */
export const appendTeamResponseReactji = new PreparedQuery<IAppendTeamResponseReactjiParams,IAppendTeamResponseReactjiResult>(appendTeamResponseReactjiIR);



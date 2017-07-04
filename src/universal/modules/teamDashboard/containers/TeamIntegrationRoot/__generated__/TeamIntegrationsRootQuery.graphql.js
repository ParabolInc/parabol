/**
 * @flow
 * @relayHash c7ef57a44c53c8ff0b0b8f6c6df8bcdf
 */

/* eslint-disable */

'use strict';

/*::
import type {ConcreteBatch} from 'relay-runtime';
export type TeamIntegrationsRootQueryResponse = {|
  +providerMap: ?{| |};
|};
*/


/*
query TeamIntegrationsRootQuery(
  $teamMemberId: ID!
) {
  providerMap(teamMemberId: $teamMemberId) {
    ...ProviderList_providerMap
  }
}

fragment ProviderList_providerMap on ProviderMap {
  github {
    ...ProviderRow_providerDetails
  }
  slack {
    ...ProviderRow_providerDetails
  }
}

fragment ProviderRow_providerDetails on ProviderRow {
  accessToken
}
*/

const batch /*: ConcreteBatch*/ = {
  "fragment": {
    "argumentDefinitions": [
      {
        "kind": "LocalArgument",
        "name": "teamMemberId",
        "type": "ID!",
        "defaultValue": null
      }
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "TeamIntegrationsRootQuery",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "teamMemberId",
            "variableName": "teamMemberId",
            "type": "ID!"
          }
        ],
        "concreteType": "ProviderMap",
        "name": "providerMap",
        "plural": false,
        "selections": [
          {
            "kind": "FragmentSpread",
            "name": "ProviderList_providerMap",
            "args": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "RootQuery"
  },
  "id": null,
  "kind": "Batch",
  "metadata": {},
  "name": "TeamIntegrationsRootQuery",
  "query": {
    "argumentDefinitions": [
      {
        "kind": "LocalArgument",
        "name": "teamMemberId",
        "type": "ID!",
        "defaultValue": null
      }
    ],
    "kind": "Root",
    "name": "TeamIntegrationsRootQuery",
    "operation": "query",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "teamMemberId",
            "variableName": "teamMemberId",
            "type": "ID!"
          }
        ],
        "concreteType": "ProviderMap",
        "name": "providerMap",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "args": null,
            "concreteType": "ProviderRow",
            "name": "github",
            "plural": false,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "args": null,
                "name": "accessToken",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "args": null,
            "concreteType": "ProviderRow",
            "name": "slack",
            "plural": false,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "args": null,
                "name": "accessToken",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "text": "query TeamIntegrationsRootQuery(\n  $teamMemberId: ID!\n) {\n  providerMap(teamMemberId: $teamMemberId) {\n    ...ProviderList_providerMap\n  }\n}\n\nfragment ProviderList_providerMap on ProviderMap {\n  github {\n    ...ProviderRow_providerDetails\n  }\n  slack {\n    ...ProviderRow_providerDetails\n  }\n}\n\nfragment ProviderRow_providerDetails on ProviderRow {\n  accessToken\n}\n"
};

module.exports = batch;

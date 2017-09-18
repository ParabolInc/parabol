import {GraphQLEnumType} from 'graphql';

import {APPROVED, DENIED, PENDING} from 'server/utils/serverConstants';

const OrgApprovalStatusEnum = new GraphQLEnumType({
  name: 'OrgApprovalStatusEnum',
  description: 'The approval status for a user joining the org',
  values: {
    [APPROVED]: {},
    [PENDING]: {},
    [DENIED]: {}
  }
});

export default OrgApprovalStatusEnum;

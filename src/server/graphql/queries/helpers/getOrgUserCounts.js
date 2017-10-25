const getOrgUserCounts = (org) => {
  return org('orgUsers')
    .filter({inactive: true})
    .count()
    .default(0)
    .do((inactiveUserCount) => {
      return {
        orgUserCount: {
          activeUserCount: org('orgUsers').count().sub(inactiveUserCount),
          inactiveUserCount
        }
      };
    });
};

export default getOrgUserCounts;

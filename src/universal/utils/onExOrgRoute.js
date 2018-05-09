import {matchPath} from 'react-router-dom';

const onExOrgRoute = (pathname, orgId) => {
  const res = matchPath(pathname, {
    path: '/me/organizations/:orgId'
  });
  return res && res.params.orgId === orgId;
};

export default onExOrgRoute;

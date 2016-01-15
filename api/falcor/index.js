import meetings from './meetings';

const subRoutes = [
  meetings
];

let allRoutes = [];
for (const routes of subRoutes) {
  allRoutes = allRoutes.concat(routes);
}

export default allRoutes;

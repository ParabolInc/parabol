import meetings from './meetings';
import falcorRouter from 'falcor-router';

const allRoutes = [
  ...meetings,
];

console.error(JSON.stringify(allRoutes));

export default falcorRouter.createClass(allRoutes);

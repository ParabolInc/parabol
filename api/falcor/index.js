import meetings from './meetings';
import falcorRouter from 'falcor-router';

const allRoutes = [
  ...meetings,
];

export default falcorRouter.createClass(allRoutes);

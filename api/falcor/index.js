import meetings from './meetings';
import FalcorRouter from 'falcor-router';

const allRoutes = [
  ...meetings,
];

class ExpressFalcorRouter extends FalcorRouter.createClass(allRoutes) {
  constructor(req, res, next) {
    super();
    this.req = req;
    this.res = res;
    this.next = next;
  }
}

export default ExpressFalcorRouter;

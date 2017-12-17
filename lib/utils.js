import _ from 'lodash';

export const mergeControllers = ({ controllers, req }) =>
  controllers.reduce(
    (all, Controller) => _.merge({ [Controller.name]: new Controller(req) }, all),
    {},
  );

import glob from 'glob';
import path from 'path';
import { mergeControllers } from './lib/utils';
import { permissions, makeRootController } from './lib/decorators';
import Crud from './lib/crud';

import * as rules from './lib/permissions';
import * as errors from './errors';

import bomanMiddleware from './lib/express-middleware';

let RootController;

const initializeModels = (db) => {
  RootController = makeRootController(db, Crud(db));
};

const InitBoman = ({ req, controllersDir }) => {
  const controllersPath = path.resolve(controllersDir);
  const controllers = glob
    .sync(`${controllersPath}/**/*.js`)
    // eslint-disable-next-line global-require, import/no-dynamic-require
    .map(file => require(path.resolve(file)).default);
  return mergeControllers({ controllers, req });
};

export { RootController, initializeModels, bomanMiddleware, permissions, rules, errors };

export default InitBoman;

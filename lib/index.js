import glob from 'glob';
import path from 'path';
import trueCasePath from 'true-case-path';

import { mergeResolvers, mergeTypes, fileLoader } from 'merge-graphql-schemas';
import { makeExecutableSchema } from 'graphql-tools';

import { createPermission } from './helpers/helpers';

import { mergeControllers } from './helpers/utils';
import { permissions, makeRootController } from './helpers/decorators';
import Crud from './helpers/crud';

import * as rules from './helpers/permissions';
import * as errors from './errors';

import bomanMiddleware from './helpers/express-middleware';

let RootController;

const createSchema = (schemaPath) => {
  const typesPath =
    (schemaPath && trueCasePath(schemaPath.typesPath)) ||
    trueCasePath(path.resolve(process.cwd(), 'src', 'graphql', 'schema'));
  const resolversPath =
    (schemaPath && trueCasePath(schemaPath.resolversPath)) ||
    trueCasePath(path.resolve(process.cwd(), 'src', 'graphql', 'schema'));

  const typeDefs = mergeTypes(fileLoader(path.resolve(`${typesPath}/**/*.gql`)));
  const resolvers = mergeResolvers(
    fileLoader(path.resolve(`${resolversPath}`), {
      extensions: ['.js'],
      recursive: true,
    }),
  );

  return makeExecutableSchema({ typeDefs, resolvers });
};

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

export {
  RootController,
  initializeModels,
  bomanMiddleware,
  permissions,
  rules,
  errors,
  createSchema,
  createPermission,
  InitBoman,
};

export default bomanMiddleware;

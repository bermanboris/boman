import glob from 'glob';
import path from 'path';
import trueCasePath from 'true-case-path';

import { mergeResolvers, mergeTypes, fileLoader } from 'merge-graphql-schemas';
import { makeExecutableSchema } from 'graphql-tools';

import { createPermission } from './helpers/helpers';

import { mergeControllers } from './helpers/utils';
import { permissions, makeRootController } from './helpers/decorators';

import * as rules from './helpers/permissions';
import * as errors from './errors';

import bomanMiddleware from './helpers/express-middleware';

// eslint-disable-next-line import/no-mutable-exports
let RootController;

const createSchema = (schemaPath) => {
  const resolvedPath = trueCasePath(path.resolve(process.cwd(), 'src', 'graphql'));
  const typesPath = (schemaPath && trueCasePath(schemaPath.typesPath)) || resolvedPath;
  const resolversPath = (schemaPath && trueCasePath(schemaPath.resolversPath)) || resolvedPath;

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
  RootController = makeRootController(db);
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

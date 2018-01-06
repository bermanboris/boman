import { buildSchema } from 'graphql';
import glob from 'glob';
import path from 'path';
import trueCasePath from 'true-case-path';
import { GraphQLUpload } from 'apollo-upload-server';
import GraphQLJSON from 'graphql-type-json';

import { mergeResolvers, mergeTypes } from 'merge-graphql-schemas';
import { makeExecutableSchema } from 'graphql-tools';
import UnionInputType from 'graphql-union-input-type';
import { PubSub } from 'graphql-subscriptions';

import fileLoader from './helpers/file-loader';

import { createPermission } from './helpers/helpers';

import { mergeControllers } from './helpers/utils';
import { permissions, makeRootController } from './helpers/decorators';

import * as rules from './helpers/permissions';
import * as errors from './errors';

import bomanMiddleware from './helpers/express-middleware';

// eslint-disable-next-line import/no-mutable-exports
let RootController;

const createSchema = ({ schemaPath, directiveResolvers } = {}) => {
  const resolvedPath = trueCasePath(path.resolve(process.cwd(), 'src', 'graphql'));
  const typesPath = (schemaPath && trueCasePath(schemaPath.typesPath)) || resolvedPath;
  const resolversPath = (schemaPath && trueCasePath(schemaPath.resolversPath)) || resolvedPath;

  const userTypeDefs = mergeTypes(fileLoader(path.resolve(`${typesPath}/**/*.gql`)));

  const userResolvers = mergeResolvers(
    fileLoader(path.resolve(`${resolversPath}`), {
      extensions: ['.js'],
      exclude: ['scalar.js'],
      recursive: true,
    }),
  );

  const scalarTypes = fileLoader(path.resolve(`${resolversPath}`), {
    extensions: ['.js'],
    include: ['scalar'],
    recursive: true,
  });

  const scalarNames = scalarTypes.map(fn => `scalar ${fn({}).name}`);
  const tempTypeDefs = mergeTypes([...scalarNames, userTypeDefs, 'scalar Upload', 'scalar JSON']);
  const types = buildSchema(tempTypeDefs);

  const combinedUnionInputs = scalarTypes.map(fn => UnionInputType(fn(types.getTypeMap())));

  const resolvers = mergeResolvers([
    userResolvers,
    { Upload: GraphQLUpload },
    { JSON: GraphQLJSON },
    ...combinedUnionInputs.map(unionInput => ({ [unionInput.name]: unionInput })),
  ]);

  const typeDefs = mergeTypes([...scalarNames, userTypeDefs, 'scalar Upload', 'scalar JSON']);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
    directiveResolvers,
  });

  return schema;
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

const pubsub = new PubSub();

export {
  pubsub,
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

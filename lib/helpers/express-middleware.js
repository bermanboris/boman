import { Router } from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import { createExpressContext } from 'apollo-resolvers';
import { formatError } from 'apollo-errors';
import cors from 'cors';
import path from 'path';
import trueCasePath from 'true-case-path';
import { apolloUploadExpress } from 'apollo-upload-server';

import { InitBoman, initializeModels, createSchema } from '../';

const router = Router();

// router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const expressGenerator = ({
  schema = createSchema(),
  db = {},
  controllersDir = trueCasePath(path.resolve(process.cwd(), 'src', 'controllers')),
} = {}) => {
  initializeModels(db);
  router.get('/', (req, res) => res.redirect('/graphiql'));
  router.use(cors({ origin: (origin, callback) => callback(null, true) }));
  router.use(
    '/graphql',
    apolloUploadExpress(),
    graphqlExpress((req) => {
      const context = createExpressContext({
        req,
        user: req.user,
        models: db,
        session: req.session,
        ...InitBoman({ req, controllersDir }),
      });

      return { schema, formatError, context };
    }),
  );

  router.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

  return router;
};

export default expressGenerator;

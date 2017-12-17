import { Router } from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import { createExpressContext } from 'apollo-resolvers';
import { formatError } from 'apollo-errors';
import cors from 'cors';

import Init, { initializeModels } from '../';

const router = Router();

router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const expressGenerator = ({ schema, db, controllersDir }) => {
  initializeModels(db);
  router.use(
    '/graphql',
    graphqlExpress((req) => {
      const context = createExpressContext({
        req,
        user: req.user,
        models: db,
        session: req.session,
        ...Init({ req, controllersDir }),
      });

      return { schema, formatError, context };
    }),
  );

  router.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

  return router;
};

export default expressGenerator;

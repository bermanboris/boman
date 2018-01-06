import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import { createExpressContext } from 'apollo-resolvers';
import { formatError } from 'apollo-errors';

import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import trueCasePath from 'true-case-path';
import { apolloUploadExpress } from 'apollo-upload-server';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { InitBoman, initializeModels, createSchema } from '../';

const app = express();

// const router = Router();

// router.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const expressGenerator = ({
  schema = createSchema(),
  port = 5555,
  corsOptions = { credentials: true, origin: (origin, callback) => callback(null, true) },
  db = {},
  sessionOptions = {},
  controllersDir = trueCasePath(path.resolve(process.cwd(), 'src', 'controllers')),
} = {}) => {
  initializeModels(db);
  setTimeout(() => {
    app.use(cors(corsOptions));
    app.get('/', (req, res) => res.redirect('/graphiql'));
    app.use(
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

        return {
          schema,
          formatError,
          context,
        };
      }),
    );

    app.use(
      '/graphiql',
      graphiqlExpress({
        endpointURL: '/graphql',
        subscriptionsEndpoint: `ws://localhost:${port}/graphql`,
      }),
    );
  }, 0);

  const server = createServer(app);
  server.listen(port, (err) => {
    if (err) {
      throw new Error(err);
    }
    console.log(`Server is listening on port: ${port}`);
    const subscriptionServer = new SubscriptionServer.create(
      {
        schema,
        execute,
        subscribe,
        onConnect(params, socket) {
          console.log('on connect!');
          return Promise.resolve();
        },
      },
      {
        server,
        path: '/graphql',
      },
    );
  });

  return app;
};

export default expressGenerator;

const express = require('express');

const { ApolloServer, gql } = require('apollo-server-express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    history: [WeekTravel!]!
  }

  type WeekTravel {
    month: String!
    weeks: [Week!]!
  }

  type Week {
    score: Int!
    points: Int!
    weekNumber: Int!
    travelCount: Int!
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    history: (root, args, context, info) => {
      const history = require('./history.json');

      return history;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

require('./routes/public')(app);

server.applyMiddleware({ app });

const port = 8090;

app.listen({ port }, function() {
  console.log(`listening on PORT *:${port}`);
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
});

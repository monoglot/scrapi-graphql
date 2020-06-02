const { getSkaters, getSkater } = require('./utils/scrape');
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Stat {
    air: Int
    landing: Int
    hangTime: Int
    switch: Int
    ollie: Int
    railBalance: Int
    speed: Int
    lipBalance: Int
    spin: Int
    manuals: Int
  }

  type Skater {
    name: String
    stance: String
    img: String
    type: String
    stats: Stat
  }

  input SkaterName {
    name: String!
  }

  type Query {
    skaters: [Skater]
    skater(input: SkaterName!): Skater
  }
`;

const resolvers = {
  Query: {
    skaters: async () => await getSkaters(),
    skater: async (_, { input: { name } }) => await getSkater(name),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

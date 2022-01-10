const express = require("express");
//adding our apollowserver
const { ApolloServer } = require("apollo-server-express");
const path = require("path");

const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");
const db = require("./config/connection");
// const routes = require("./routes"); no longer in use

const app = express();
const PORT = process.env.PORT || 3001;

//This is how we use our schemas
const server = new ApolloServer({
  typeDefs,
  resolvers,
  //used for passing data to the resolver function
  context: authMiddleware,
});

server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

//incase an invalid route takes user back to home
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// app.use(routes); no longer in use

db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`🌍 API server running on port ${PORT}!`);
    console.log(
      `🌍 Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
});

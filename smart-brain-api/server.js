const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const knex = require("knex")({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "yanndebain",
    password: "",
    database: "smart-brain",
  },
});

const saltRounds = 10;

const app = express();
app.use(express.json());
app.use(cors());

// "/"
app.get("/", (req, res) => {
  res.send("success");
});

// "/signin"
app.post("/signin", (req, res) => {
  knex
    .select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then((data) => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return knex
          .select()
          .from("users")
          .where("email", "=", req.body.email)
          .then((user) => res.json(user[0]))
          .catch(res.status(400).json("Unable to get user"));
      } else {
        res.status(400).json("Wrong credentials");
      }
    })
    .catch(res.status(400).json("Wrong credentials"));
});

// "/register"
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  const hash = bcrypt.hashSync(password, saltRounds);

  knex
    .transaction((trx) => {
      trx
        .insert({
          email: email,
          hash: hash,
        })
        .into("login")
        .returning("email")
        .then((loginEmail) => {
          return trx("users")
            .returning("*")
            .insert({
              name: name,
              email: loginEmail[0],
              joined: new Date(),
            })
            .then((user) => {
              res.json(user[0]);
            });
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch(res.status(400).json("Unable to register"));
});

// "/profile/:userId"
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  knex
    .select()
    .from("users")
    .where("id", id)
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("Error getting user");
      }
    });
});

// "/image"
app.put("/image", (req, res) => {
  const { id } = req.body;
  knex("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => res.json(entries[0]))
    .catch(res.status(400).json("Unable to get entries"));
});

app.listen(8000, () => {
  console.log("Running on port 8000");
});

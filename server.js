require("dotenv").config();
const express = require("express");
const history = require("connect-history-api-fallback");
const _ = require("lodash");
const bodyParser = require("body-parser");
const cors = require("cors");
const okta = require("./services/okta");
const oktaInstance = new okta();
const jwt_decode = require("jwt-decode");
const router = express.Router();
const app = express();
const host = "http://localhost";
const port = 9090;

// Middleware for serving '/dist' directory
const staticFileMiddleware = express.static("public");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// User CORS only for dev
if (process.env.NODE_ENV !== "production") {
  app.use(cors());
}

router.get("/", async function (req, res) {
  return res.status(200).json({ message: "Welcome guest" });
});

router.post("/profile", async function (req, res) {
  var idtoken = jwt_decode(req.body.id_token);
  var accessToken = jwt_decode(req.body.access_token);
  return res.status(200).json({ ...req.body, idtoken, accessToken });
});

router.post("/guest/new", async function (req, res) {
  try {
    if (!_.get(req, "body.email")) {
      return res.status(400).json({ error: "Please send a valid email" });
    }
    console.log("Creating guest");
    const guest = await oktaInstance.createGuestOption2(`${req.body.email}`);

    res.json({
      guest,
    });
  } catch (error) {
    console.error(JSON.stringify(error));
    return res.status(error.status).json(error);
  }
});

app.use("/api", router);

// 1st call for unredirected requests
app.use(staticFileMiddleware);

// Support history api
// this is the HTTP request path not the path on disk
app.use(
  history({
    index: "/index.html",
  })
);

// 2nd call for redirected requests
app.use(staticFileMiddleware);

app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`);
});

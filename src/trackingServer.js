const express = require("express");
const path = require("path");
const { body, validationResult } = require("express-validator");
const { EventModel } = require("./eventModel");
const { trackerPort } = require("./config");
const cors = require("cors");

const corsOptions = {
  origin: "*",
  optionSuccessStatus: 200,
};

const trackerApp = express();

trackerApp.options("*", cors(corsOptions));

trackerApp.use(express.json());

trackerApp.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "./tracker.js"));
});

trackerApp.post(
  "/track",
  cors(corsOptions),
  body("events").isArray(),
  body("events.*.event").isString(),
  body("events.*.tags").isArray(),
  body("events.*.tags.*").isString(),
  body("events.*.url").isURL({ require_tld: false }),
  body("events.*.title").isString(),
  body("events.*.ts").isISO8601(),
  (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(400).json({ errors: errors.array() });
      }

      const eventsData = req?.body?.events || [];
      const eventsToSave = eventsData.map(
        (eventData) => new EventModel(eventData)
      );

      EventModel.collection
        .insertMany(eventsToSave)
        .then((res) => console.log(res))
        .catch((err) => console.log(err));

      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: "Error while saving events" });
    }
  }
);

const startTrackingServer = () => {
  trackerApp.listen(trackerPort);
  console.log("Tracking app started at http://localhost:" + trackerPort);
};

module.exports = {
  startTrackingServer,
};

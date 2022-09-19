const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  event: String,
  tags: [String],
  url: String,
  title: String,
  ts: String,
});

const EventModel = mongoose.model("event", eventSchema);

module.exports = {
  EventModel,
};

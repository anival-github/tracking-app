const express = require("express");
const path = require("path");
const { staticFilesPort } = require("./config");

const staticFilesApp = express();

staticFilesApp.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

staticFilesApp.get("/1.html", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

staticFilesApp.get("/2.html", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

staticFilesApp.get("/tracker.js", (req, res) => {
  res.sendFile(path.join(__dirname, "./tracker.js"));
});

const startStaticServer = () => {
  staticFilesApp.listen(staticFilesPort);
  console.log("Static server started at http://localhost:" + staticFilesPort);
};

module.exports = {
  startStaticServer,
};

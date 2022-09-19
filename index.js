const { startStaticServer } = require("./src/staticServer");
const { startTrackingServer } = require("./src/trackingServer");
const { connectToDb } = require("./src/db");

const main = async () => {
  try {
    await connectToDb();
    startStaticServer();
    startTrackingServer();
  } catch (error) {
    console.log(error);
  }
};

main();

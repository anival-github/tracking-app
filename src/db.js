const mongoose = require("mongoose");
const { connectionStr } = require("./config");

const connectToDb = async () => {
  try {
    const result = await mongoose.connect(connectionStr);
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  connectToDb,
};

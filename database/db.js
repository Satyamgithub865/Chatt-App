import mongoose from "mongoose";

const URL = "mongodb://localhost:27017/chatt-app";

export const Connection = async () => {
  try {
    await mongoose.connect(URL);

    console.log("connected to db");
  } catch (error) {
    console.log("error while connecting to db", error.message);
  }
};

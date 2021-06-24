import dotenv from "dotenv";
import app from './app'
import connectMongoDB from "./core/db";

dotenv.config({ path: `${__dirname}/config.env` });

const port = process.env.PORT || 8080
connectMongoDB()
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

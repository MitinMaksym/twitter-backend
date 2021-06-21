import express from "express";

const app = express();

app.get("/hello", (_: express.Request, res: express.Response) => {
  res.send("Hello");
});

app.listen(8080, () => {
  console.log("App is running");
});

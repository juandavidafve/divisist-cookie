import express from "express";

import { PORT } from "./config";
import { getCookie } from "./scrapper";

const app = express();

app.get("/cookie", async (req, res) => {
  try {
    const cookie = await getCookie();

    console.log("Cookie obtained sucessfully");

    res.send({
      cookie,
    });
  } catch (err) {
    console.log(err);

    if (err instanceof Error) {
      res.send({
        error: true,
        msg: err.message,
      });
    } else {
      res.send({
        error: true,
        msg: "Unknown Error",
      });
    }
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

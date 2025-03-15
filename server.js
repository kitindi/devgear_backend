import express from "express";

// create express instance

const app = express();
const PORT = 4000;

app.get("/", (req, res) => {
  res.send(`It works well`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT} at http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CricketFit API is running");
});

app.post("/practice", (req, res) => {
  console.log(req.body);

  res.json({
    message: "Practice session received",
  });
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
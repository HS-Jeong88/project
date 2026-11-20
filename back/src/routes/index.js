import express from "express";
const router = express.Router();

router.use("/", (req, res) => {
  res.send("Welcome to the home page");
});

export default router;

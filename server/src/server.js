import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// .env ফাইল লোড করার জন্য
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// মিডলওয়্যার
app.use(cors());
app.use(express.json());

// বেসিক রুট
app.get("/", (req, res) => {
  res.send("Node.js running....");
});

// সার্ভার লিসেন
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

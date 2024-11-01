const express = require("express");
const cors = require("cors");
const websiteRoutes = require("./routes/websiteRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use("/api/websites", websiteRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

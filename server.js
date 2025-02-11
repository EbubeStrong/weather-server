import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch"; // ✅ Fix: Ensure fetch works in Node.js
import APIKEY from "./config.js"; // Import API key from config.js

dotenv.config(); // Load environment variables (if needed)

const app = express();
const PORT = process.env.PORT || 3000; // Use default port if env is not set
const API_KEY = APIKEY; // Assign API key from config.js

console.log("API Key:", API_KEY);

app.use(
  cors({
    origin: ["https://d-weather-app.vercel.app/", "http://127.0.0.1:5500"],
    // origin: "http://127.0.0.1:5500",
    methods: "GET",
    allowedHeaders: ["Content-Type"], // ✅ Fix: Ensure proper CORS headers
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all domains
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(204); // No content response
});


// ✅ Root `/` Route for Testing
app.get("/", (req, res) => {
  res.send("Weather API is running!"); 
});

// ✅ `/weather` Route
app.get("/weather", async (req, res) => {
  const { city, endPoint, lon, lat } = req.query;

  if ((!city && (!lat || !lon)) || !endPoint) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  let url = `https://api.openweathermap.org/data/2.5/${endPoint}?appid=${API_KEY}&units=metric`;

  if (lat && lon) {
    url += `&lat=${lat}&lon=${lon}`;
  } else if (city) {
    url += `&q=${city}`;
  }

  console.log("Fetching weather data from:", url); // ✅ Fix: Debugging log

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch weather data" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ `/forecast` Route
app.get("/forecast", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing latitude or longitude" });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch weather data" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Default 404 Error Handling
app.use((req, res) => {
  res.status(404).send({ error: "Route not found!" });
});

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

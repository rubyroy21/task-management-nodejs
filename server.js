const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const xlsx = require("xlsx");
const multer = require("multer");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Mock task data (replace with database integration)
let tasks = [];

// Endpoint to get tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// Endpoint to add a new task
app.post("/tasks", (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).send("Task title is required");
  }
  const newTask = {
    _id: tasks.length + 1, // Mock ID generation
    title,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Endpoint to update a task
app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((task) => task._id === taskId);
  if (taskIndex === -1) {
    return res.status(404).send("Task not found");
  }
  tasks[taskIndex].completed = true; // Example: Marking task as completed
  res.json(tasks[taskIndex]);
});

// Endpoint to delete a task
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  tasks = tasks.filter((task) => task._id !== taskId);
  res.sendStatus(204); // No content response
});

// Endpoint to upload Excel file
app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  // Parse Excel file
  const workbook = xlsx.readFile(file.path);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(worksheet);

  // Add tasks to database
  tasks = tasks.concat(
    data.map((item) => ({
      title: item.title,
    }))
  );

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

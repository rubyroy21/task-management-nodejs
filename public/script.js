let taskList;
let uploadedFileName = "";

document.addEventListener("DOMContentLoaded", () => {
  taskList = document.getElementById("task-list");
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const uploadForm = document.getElementById("upload-form");
  const excelFileInput = document.getElementById("excel-file");
  const updateForm = document.getElementById("update-form");
  const updateInput = document.getElementById("update-input");

  // Function to fetch tasks from the server
  const fetchTasks = async () => {
    try {
      const response = await fetch("/tasks");
      const tasks = await response.json();
      renderTasks(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Function to render tasks
  const renderTasks = (tasks) => {
    taskList.innerHTML = "";
    tasks.forEach((task) => {
      if (task.title !== undefined) {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");
        taskItem.innerHTML = `
          <span>${task.title}</span>
          <button class="update-btn" data-id="${task._id}">Update</button>
          <button class="delete-btn" data-id="${task._id}">Delete</button>
        `;
        taskList.appendChild(taskItem);

        // Add event listener to update button
        const updateButton = taskItem.querySelector(".update-btn");
        updateButton.addEventListener("click", () => openUpdateForm(task));
      }
    });
  };

  // Function to open update form
  const openUpdateForm = (task) => {
    updateInput.value = task.title;
    updateForm.style.display = "block";

    // Add event listener to update form submission
    updateForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const updatedTitle = updateInput.value.trim();
      if (updatedTitle) {
        updateTask(task._id, updatedTitle);
      }
    });
  };

  // Function to add a new task
  const addTask = async (title) => {
    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) {
        throw new Error("Failed to add task");
      }
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Function to handle task form submission
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (title) {
      addTask(title);
      taskInput.value = "";
    }
  });

  // Function to handle file upload form submission
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", excelFileInput.files[0]);

    const fileName = excelFileInput.files[0].name;

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      if (!uploadedFileName) {
        uploadedFileName = fileName;
        const fileUploadLabel = document.getElementById("file-upload-label");
        fileUploadLabel.textContent = uploadedFileName;
      }

      fetchTasks();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  });

  // Fetch tasks on page load
  fetchTasks();
});

// Define updateTask function globally
const updateTask = async (taskId, updatedTitle) => {
  try {
    const response = await fetch(`/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: updatedTitle }),
    });
    if (!response.ok) {
      throw new Error("Failed to update task");
    }
    fetchTasks(); // Refresh task list after updating
  } catch (error) {
    console.error("Error updating task:", error);
  }
};

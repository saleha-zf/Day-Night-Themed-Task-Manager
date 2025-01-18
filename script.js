// Elements
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');
const body = document.body;
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskTime = document.getElementById('taskTime');
const taskPriority = document.getElementById('taskPriority');
const taskList = document.getElementById('taskList');
const navbarTitle = document.getElementById('navbarTitle');  // Navbar title element

// Initial State
let isNightMode = false;

// Elements
const currentTimeElement = document.getElementById('currentTime');

// Update Current Time in AM/PM format
function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    let period = 'AM';
    
    if (hours >= 12) {
      period = 'PM';
      if (hours > 12) {
        hours -= 12;  // Convert to 12-hour format
      }
    } else if (hours === 0) {
      hours = 12;  // Midnight case, set to 12 AM
    }
  
    hours = hours.toString().padStart(2, '0');  // Ensure 2 digits for hour (e.g., 08, 09)
  
    currentTimeElement.textContent = `${hours}:${minutes}:${seconds} ${period}`;
}

// Call the updateTime function every second
setInterval(updateTime, 1000);

// Toggle Theme
themeToggle.addEventListener('click', () => {
  isNightMode = !isNightMode;
  body.setAttribute('data-theme', isNightMode ? 'night' : 'day');
  sunIcon.style.display = isNightMode ? 'none' : 'inline';  // Hide sun in night mode
  moonIcon.style.display = isNightMode ? 'inline' : 'none'; // Show moon in night mode
  updatePlaceholders();
  updateTaskVisibility();  // Update task visibility when toggling modes
  navbarTitle.textContent = isNightMode ? "Night Time Tasks" : "Day Time Tasks"; // Change navbar title
});

// Update Form Placeholders
function updatePlaceholders() {
  taskInput.placeholder = isNightMode ? 'Skincare, sleep routine' : 'Exercise, meetings';
}

// Add Task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const task = taskInput.value.trim();
  const time = taskTime.value;
  const priority = taskPriority.value;

  if (!task || !time) {
    alert('Please fill out all fields!');
    return;
  }

  addTask(task, time, priority);
  taskForm.reset();
});

// Add Task to List
function addTask(task, time, priority) {
  const taskTimeArr = time.split(':');
  let hour = parseInt(taskTimeArr[0], 10);
  const minute = taskTimeArr[1];

  // Convert to 24-hour format if necessary
  let period = 'AM';
  if (hour >= 12) {
    period = 'PM';
    if (hour > 12) hour -= 12;
  }
  
  // Store task time in 24-hour format
  const taskHour24 = (period === 'PM' && hour !== 12) ? hour + 12 : hour;  // Convert PM hours to 24-hour format

  const li = document.createElement('li');
  li.className = `task-item ${priority}`;
  li.innerHTML = `
    <span class="priority">${priority.toUpperCase()}</span>
    <span class="delete-task">X</span>
    <p class="task-time">${hour}:${minute} ${period}</p>
    <p class="task-description">${task}</p>
    <button class="finish-task">Finish</button>
  `;
  
  li.dataset.hour = taskHour24;  // Store task time in 24-hour format in data-hour attribute
  taskList.appendChild(li);

  const finishButton = li.querySelector('.finish-task');
  const deleteButton = li.querySelector('.delete-task');

  finishButton.addEventListener('click', () => {
    li.style.backgroundColor = '#d3d3d3'; // Mark as finished
    finishButton.setAttribute('disabled', true);
    deleteButton.setAttribute('disabled', true);
    alert(`Congratulations! You have completed the task: "${task}"`);  // Congratulations message
    triggerConfetti();  // Trigger confetti animation
  });

  deleteButton.addEventListener('click', () => {
    li.remove();
    alert('Task deleted successfully!');  // Task deleted message
  });

  setTaskTimer(time, task);
  updateTaskVisibility(); // Ensure tasks are correctly displayed based on the current time
}

// Task Timer and Alert
function setTaskTimer(time, task) {
  const [hour, minute] = time.split(':');
  const taskTime = new Date();
  taskTime.setHours(hour, minute, 0, 0);

  const interval = setInterval(() => {
    const now = new Date();
    if (now >= taskTime) {
      alert(`Time is up! You've not completed your task: "${task}" yet.`);
      clearInterval(interval);
    }
  }, 1000);
}

// Update Task Visibility Based on Day/Night Mode
function updateTaskVisibility() {
  const currentHour = new Date().getHours(); // 24-hour format of the current time
  const tasks = document.querySelectorAll('.task-item');

  tasks.forEach((task) => {
    const taskHour = parseInt(task.dataset.hour, 10);  // This is already a 24-hour format hour

    // In night mode (6 PM - 6 AM), show tasks with times between 6 PM and 6 AM
    if (isNightMode) {
      if (taskHour >= 18 || taskHour < 6) {  // Night tasks should have time between 6 PM (18) and 6 AM (6)
        task.style.display = 'block';
      } else {
        task.style.display = 'none';
      }
    } 
    // In day mode (6 AM - 6 PM), show tasks with times between 6 AM and 6 PM
    else {
      if (taskHour >= 6 && taskHour < 18) {  // Day tasks should have time between 6 AM (6) and 6 PM (18)
        task.style.display = 'block';
      } else {
        task.style.display = 'none';
      }
    }
  });
}
// Function to trigger confetti
function triggerConfetti() {
    if (typeof canvasConfetti === 'undefined') {
      console.error('Canvas Confetti library is not loaded.');
      return;
    }
  
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
  
    const confetti = canvasConfetti.create(canvas, {
      resize: true,
      useWorker: true
    });
  
    const confettiCount = 150; // Number of confetti pieces
    const angleRange = isNightMode ? [0, 360] : [90, 270]; // Adjust direction for day/night mode
  
    // Loop to trigger confetti with random properties
    for (let i = 0; i < confettiCount; i++) {
      confetti({
        particleCount: 1,
        angle: Math.random() * (angleRange[1] - angleRange[0]) + angleRange[0],
        spread: 45,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2
        },
        shape: 'circle',
        size: Math.random() * 10 + 5, // Random size
        colors: [isNightMode ? '#f5f5f5' : '#FFD700'], // Light colors for moons (night), golden for suns (day)
        image: isNightMode ? 'moon.png' : 'sun.png', // Use little moon or sun images for confetti
        drift: 0.2,
        gravity: 0.5,
      });
    }
  
    // Remove the canvas after the animation is done
    setTimeout(() => {
      document.body.removeChild(canvas);
    }, 1000);
  }
  
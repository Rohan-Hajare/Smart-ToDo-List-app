// js file starting
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const cancelTaskBtn = document.getElementById('cancelTaskBtn');

const taskTitleInput = document.getElementById('taskTitle');
const taskDescInput = document.getElementById('taskDescription');
const taskCategorySelect = document.getElementById('taskCategory');
const taskDueDateInput = document.getElementById('taskDueDate');
const taskPrioritySelect = document.getElementById('taskPriority');

const taskTemplate = document.getElementById('taskTemplate');
const categories = ['work', 'personal', 'study', 'health', 'other'];

// Load Tasks on startup
window.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  setupSidebarFilters();
  setupStatusFilters();
  setupSearch(); 
});

function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  savedTasks.forEach(task => addTaskToCategory(task));
}

function saveTasksToLocalStorage() {
  const allTasks = [];
  categories.forEach(cat => {
    const list = document.getElementById(`${cat}-tasks`);
    if (!list) return;
    list.querySelectorAll('.task-item').forEach(task => {
      const title = task.querySelector('.task-title')?.textContent;
      const desc = task.querySelector('.task-desc')?.textContent;
      const priority = task.querySelector('.task-priority')?.textContent.toLowerCase();
      const dueDate = task.querySelector('.task-date')?.textContent.replace('Due: ', '');
      const checked = task.querySelector('.task-check')?.checked;
      allTasks.push({ title, desc, priority, dueDate, category: cat, checked });
    });
  });

  localStorage.setItem('tasks', JSON.stringify(allTasks));
}

// Modal Controls
addTaskBtn.addEventListener('click', () => {
  taskModal.classList.remove('hidden');
  clearModalInputs();
});
cancelTaskBtn.addEventListener('click', () => {
  taskModal.classList.add('hidden');
  clearModalInputs();
});
window.addEventListener('click', (e) => {
  if (e.target === taskModal) {
    taskModal.classList.add('hidden');
    clearModalInputs();
  }
});

function clearModalInputs() {
  taskTitleInput.value = '';
  taskDescInput.value = '';
  taskCategorySelect.value = 'work';
  taskDueDateInput.value = '';
  taskPrioritySelect.value = 'medium';
}

// Save task (with mandatory date validation)
saveTaskBtn.addEventListener('click', () => {
  const title = taskTitleInput.value.trim();
  if (!title) return alert('Task title is required');

  const dueDate = taskDueDateInput.value.trim();
  if (!dueDate) return alert('Due date is required');

  const desc = taskDescInput.value.trim();
  const category = taskCategorySelect.value;
  const priority = taskPrioritySelect.value;

  addTaskToCategory({ title, desc, category, dueDate, priority });
  saveTasksToLocalStorage();
  taskModal.classList.add('hidden');
  clearModalInputs();
  showToast('✅ Task added successfully!');
});

// Add task to UI
function addTaskToCategory({ title, desc, category, dueDate, priority, checked = false }) {
  if (!categories.includes(category)) return;
  const taskList = document.getElementById(`${category}-tasks`);
  if (!taskList) return;

  const taskClone = taskTemplate.content.cloneNode(true);
  const taskItem = taskClone.querySelector('li');
  const taskTitleEl = taskClone.querySelector('.task-title');
  const taskDescEl = taskClone.querySelector('.task-desc');
  const taskPriorityEl = taskClone.querySelector('.task-priority');
  const taskDateEl = taskClone.querySelector('.task-date');
  const checkbox = taskClone.querySelector('.task-check');
  const deleteBtn = taskClone.querySelector('.delete-task');
  const editBtn = taskClone.querySelector('.edit-task');

  taskTitleEl.textContent = title;
  taskDescEl.textContent = desc || '';
  taskPriorityEl.textContent = capitalize(priority);
  taskPriorityEl.className = `task-priority ${priority}`;
  taskDateEl.textContent = dueDate ? `Due: ${dueDate}` : '';
  checkbox.checked = checked;

  if (checked) {
    taskItem.style.opacity = '0.6';
    taskTitleEl.style.textDecoration = 'line-through';
  }

  checkbox.addEventListener('change', (e) => {
    taskItem.style.opacity = e.target.checked ? '0.6' : '1';
    taskTitleEl.style.textDecoration = e.target.checked ? 'line-through' : 'none';
    saveTasksToLocalStorage();
  });

  deleteBtn.addEventListener('click', () => {
    taskItem.remove();
    saveTasksToLocalStorage();
  });

  editBtn.addEventListener('click', () => {
    taskTitleInput.value = title;
    taskDescInput.value = desc;
    taskCategorySelect.value = category;
    taskDueDateInput.value = dueDate;
    taskPrioritySelect.value = priority;

    taskItem.remove();
    saveTasksToLocalStorage();
    taskModal.classList.remove('hidden');
  });

  taskList.appendChild(taskClone);
}

// Capitalize utility
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Toast Message
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 3000);
}

// 🟨 Sidebar Navigation Filter
function setupSidebarFilters() {
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');

      const text = e.target.textContent.toLowerCase();
      if (text.includes('dashboard')) filterBySidebar('all');
      else if (text.includes('today')) filterBySidebar('today');
      else if (text.includes('upcoming')) filterBySidebar('upcoming');
      else if (text.includes('important')) filterBySidebar('important');
    });
  });
}

function filterBySidebar(type) {
  const allTasks = document.querySelectorAll('.task-item');
  const today = new Date().toISOString().split('T')[0];

  allTasks.forEach(task => {
    const dueText = task.querySelector('.task-date')?.textContent || '';
    const taskDue = dueText.replace('Due: ', '');
    const priority = task.querySelector('.task-priority')?.textContent.toLowerCase();

    switch (type) {
      case 'all':
        task.style.display = '';
        break;
      case 'today':
        task.style.display = taskDue === today ? '' : 'none';
        break;
      case 'upcoming':
        task.style.display = taskDue > today ? '' : 'none';
        break;
      case 'important':
        task.style.display = priority === 'high' ? '' : 'none';
        break;
    }
  });
}

// 🟩 All/Active/Completed Filter
function setupStatusFilters() {
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const type = button.textContent.toLowerCase();
      filterByStatus(type);
    });
  });
}

function filterByStatus(type) {
  const allTasks = document.querySelectorAll('.task-item');

  allTasks.forEach(task => {
    const isChecked = task.querySelector('.task-check')?.checked;

    switch (type) {
      case 'all':
        task.style.display = '';
        break;
      case 'active':
        task.style.display = !isChecked ? '' : 'none';
        break;
      case 'completed':
        task.style.display = isChecked ? '' : 'none';
        break;
    }
  });
}

// Sorting
document.getElementById('sortBy')?.addEventListener('change', (e) => {
  sortTasks(e.target.value);
});

function sortTasks(type) {
  categories.forEach(cat => {
    const list = document.getElementById(`${cat}-tasks`);
    const tasks = Array.from(list.children);

    tasks.sort((a, b) => {
      if (type === 'date') {
        const aDate = new Date(a.querySelector('.task-date')?.textContent.replace('Due: ', ''));
        const bDate = new Date(b.querySelector('.task-date')?.textContent.replace('Due: ', ''));
        return aDate - bDate;
      } else if (type === 'priority') {
        const p = { high: 1, medium: 2, low: 3 };
        return p[a.querySelector('.task-priority')?.textContent.toLowerCase()] -
               p[b.querySelector('.task-priority')?.textContent.toLowerCase()];
      } else if (type === 'status') {
        return a.querySelector('.task-check').checked - b.querySelector('.task-check').checked;
      }
    });

    list.innerHTML = '';
    tasks.forEach(t => list.appendChild(t));
  });
}

// search functionality
// 🔍 Setup Search Functionality
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    filterTasksBySearch(query);
  });
}

function filterTasksBySearch(query) {
  const allTasks = document.querySelectorAll('.task-item');

  allTasks.forEach(task => {
    const title = task.querySelector('.task-title')?.textContent.toLowerCase() || '';
    const desc = task.querySelector('.task-desc')?.textContent.toLowerCase() || '';
    const date = task.querySelector('.task-date')?.textContent.replace('Due: ', '').toLowerCase() || '';
    const priority = task.querySelector('.task-priority')?.textContent.toLowerCase() || '';
    const category = task.closest('ul')?.id.replace('-tasks', '').toLowerCase() || '';

    const match = title.includes(query) ||
                  desc.includes(query) ||
                  date.includes(query) ||
                  priority.includes(query) ||
                  category.includes(query);

    task.style.display = match ? '' : 'none';
  });
}

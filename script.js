const form = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
let tasks = JSON.parse(localStorage.getItem('studyflowTasks') || '[]');

document.getElementById('todayLabel').textContent =
  new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
document.getElementById('taskDeadline').min = new Date().toISOString().slice(0, 10);

function saveTasks() {
  localStorage.setItem('studyflowTasks', JSON.stringify(tasks));
}
function updateStats() {
  document.getElementById('totalCount').textContent = tasks.length;
  document.getElementById('pendingCount').textContent = tasks.filter(task => !task.completed).length;
  document.getElementById('completedCount').textContent = tasks.filter(task => task.completed).length;
}
function renderTasks() {
  const search = searchInput.value.trim().toLowerCase();
  const filter = statusFilter.value;
  const visibleTasks = tasks.filter(task => {
    const matchesText = task.title.toLowerCase().includes(search) ||
      task.category.toLowerCase().includes(search);
    const matchesStatus = filter === 'all' ||
      (filter === 'completed' && task.completed) ||
      (filter === 'pending' && !task.completed);
    return matchesText && matchesStatus;
  });
  taskList.replaceChildren();
  emptyMessage.hidden = visibleTasks.length > 0;
  visibleTasks.forEach(task => {
    const item = document.createElement('article');
    item.className = `task-item ${task.completed ? 'done' : ''}`;
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'task-check';
    check.checked = task.completed;
    check.setAttribute('aria-label', `Mark ${task.title} completed`);
    check.addEventListener('change', () => {
      task.completed = check.checked;
      saveTasks(); renderTasks();
    });
    const info = document.createElement('div');
    info.className = 'task-info';
    const title = document.createElement('div');
    title.className = 'task-title'; title.textContent = task.title;
    const meta = document.createElement('div');
    meta.className = 'task-meta';
    meta.textContent = `${task.category} · Due ${task.deadline}`;
    info.append(title, meta);
    const priority = document.createElement('span');
    priority.className = `pill ${task.priority}`; priority.textContent = task.priority;
    const remove = document.createElement('button');
    remove.className = 'delete-btn'; remove.textContent = 'Delete';
    remove.addEventListener('click', () => {
      tasks = tasks.filter(entry => entry.id !== task.id);
      saveTasks(); renderTasks();
    });
    item.append(check, info, priority, remove);
    taskList.append(item);
  });
  updateStats();
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const title = document.getElementById('taskTitle').value.trim();
  const deadline = document.getElementById('taskDeadline').value;
  if (!title || !deadline) return;
  tasks.push({
    id: Date.now(), title,
    category: document.getElementById('taskCategory').value,
    deadline,
    priority: document.getElementById('taskPriority').value,
    completed: false
  });
  saveTasks(); form.reset();
  document.getElementById('taskDeadline').min = new Date().toISOString().slice(0, 10);
  renderTasks();
});
searchInput.addEventListener('input', renderTasks);
statusFilter.addEventListener('change', renderTasks);
renderTasks();

document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("task-form");
    const textInput = document.getElementById("text-input");
    const addTaskBtn = document.getElementById("add-task-btn");
    const taskList = document.getElementById("task-list");
    const progressBar = document.getElementById("progress");
    const numbers = document.getElementById("numbers");
    const emptyState = document.getElementById("empty-state");

    // Load tasks from LocalStorage on start
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const saveTasks = () => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    };

    const updateProgress = () => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.completed).length;

        // Update progress bar
        const percentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
        progressBar.style.width = `${percentage}%`;

        // Update numbers
        numbers.innerHTML = `<p>${completedTasks} / ${totalTasks}</p>`;

        // Toggle empty state
        if (totalTasks === 0) {
            emptyState.style.display = "block";
            taskList.style.display = "none";
        } else {
            emptyState.style.display = "none";
            taskList.style.display = "block";
        }
    };

    const renderTasks = () => {
        taskList.innerHTML = "";

        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            if (task.completed) li.classList.add("completed");

            li.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
                    <span>${task.text}</span>
                </div>
                <div class="task-buttons">
                    <button class="edit-btn" ${task.completed ? "disabled" : ""}>
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="delete-btn">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;

            // Checkbox Event
            const checkbox = li.querySelector(".task-checkbox");
            checkbox.addEventListener("change", () => {
                tasks[index].completed = checkbox.checked;
                li.classList.toggle("completed", checkbox.checked);

                // Enable/Disable edit button
                const editBtn = li.querySelector(".edit-btn");
                editBtn.disabled = checkbox.checked;

                saveTasks();
                updateProgress();
            });

            // Edit Event
            const editBtn = li.querySelector(".edit-btn");
            editBtn.addEventListener("click", () => {
                // Remove current task and populate input
                const taskText = tasks[index].text;
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
                updateProgress();

                textInput.value = taskText;
                textInput.focus();
            });

            // Delete Event
            const deleteBtn = li.querySelector(".delete-btn");
            deleteBtn.addEventListener("click", () => {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
                updateProgress();
            });

            taskList.appendChild(li);
        });

        updateProgress();
    };

    const addTask = (e) => {
        e.preventDefault(); // Prevents page reload
        const taskText = textInput.value.trim();

        if (!taskText) {
            alert("Please enter a task!");
            return;
        }

        tasks.push({ text: taskText, completed: false });
        saveTasks();
        renderTasks();
        textInput.value = "";
        textInput.focus();
    };

    // Event Listeners
    taskForm.addEventListener("submit", addTask);

    // Initial Render
    renderTasks();
});

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let editingId = null;

// ---------- ADD TASK ----------
function addTask() {
    const input = document.getElementById('taskInput');
    const priority = document.getElementById('priorityInput').value;
    const text = input.value.trim();
    if (text === '') return;

    tasks.push({
        id: Date.now(),
        text: text,
        completed: false,
        priority: priority
    });

    input.value = '';
    saveAndRender();
}

// ---------- SAVE & RENDER ----------
function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

// ---------- RENDER TASKS ----------
function renderTasks() {
    const list = document.getElementById('taskList');
    const search = document.getElementById('searchInput').value.toLowerCase();
    list.innerHTML = '';

    let filtered = tasks.filter(task => {
        // Filter by status
        if (currentFilter === 'active' && task.completed) return false;
        if (currentFilter === 'completed' && !task.completed) return false;
        // Filter by search
        if (search && !task.text.toLowerCase().includes(search)) return false;
        return true;
    });

    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = `priority-${task.priority}`;
        if (task.completed) li.classList.add('completed');

        // Task text or edit input
        if (editingId === task.id) {
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = task.text;
            editInput.id = 'editInput';
            li.appendChild(editInput);
        } else {
            const span = document.createElement('span');
            span.textContent = task.text;
            li.appendChild(span);
        }

        // Actions
        const actions = document.createElement('div');
        actions.className = 'actions';

        if (editingId === task.id) {
            // Save button
            const saveBtn = document.createElement('button');
            saveBtn.textContent = '💾';
            saveBtn.onclick = () => saveEdit(task.id);
            actions.appendChild(saveBtn);

            // Cancel button
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = '❌';
            cancelBtn.onclick = () => { editingId = null; renderTasks(); };
            actions.appendChild(cancelBtn);
        } else {
            // Toggle complete
            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = task.completed ? '↩️' : '✅';
            toggleBtn.onclick = () => toggleTask(task.id);
            actions.appendChild(toggleBtn);

            // Edit
            const editBtn = document.createElement('button');
            editBtn.textContent = '✏️';
            editBtn.onclick = () => { editingId = task.id; renderTasks(); };
            actions.appendChild(editBtn);

            // Delete
            const delBtn = document.createElement('button');
            delBtn.textContent = '🗑️';
            delBtn.onclick = () => deleteTask(task.id);
            actions.appendChild(delBtn);
        }

        li.appendChild(actions);
        list.appendChild(li);
    });
}

// ---------- TOGGLE ----------
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    saveAndRender();
}

// ---------- DELETE ----------
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

// ---------- EDIT ----------
function saveEdit(id) {
    const newText = document.getElementById('editInput').value.trim();
    if (newText === '') return;
    const task = tasks.find(t => t.id === id);
    task.text = newText;
    editingId = null;
    saveAndRender();
}

// ---------- FILTER ----------
function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderTasks();
}

// ---------- INITIAL RENDER ----------
renderTasks();
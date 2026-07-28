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
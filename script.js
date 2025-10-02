document.addEventListener('DOMContentLoaded', () => {
    // Referensi elemen DOM
    const taskTextInput = document.getElementById('task-text-input');
    const dueDateInput = document.getElementById('due-date-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterSelect = document.getElementById('filter-select');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const emptyListMessage = document.getElementById('empty-list-message');

    // Array untuk menyimpan tugas, diinisialisasi dari Local Storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // --- FUNGSI UTAMA ---

    // 1. Menyimpan tugas ke Local Storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks(); // Render ulang tampilan setelah perubahan
    }

    // 2. Menambahkan tugas baru
    function addTask() {
        const text = taskTextInput.value.trim();
        const dueDate = dueDateInput.value; // Format YYYY-MM-DD

        if (text === "") {
            alert("Deskripsi tugas tidak boleh kosong!");
            return;
        }

        const newTask = {
            id: Date.now(), // ID unik untuk setiap tugas
            text: text,
            dueDate: dueDate,
            completed: false
        };

        tasks.push(newTask);
        taskTextInput.value = ''; // Kosongkan input
        dueDateInput.value = '';   // Kosongkan input tanggal
        saveTasks();
    }

    // 3. Render (menampilkan) semua tugas ke UI
    function renderTasks() {
        taskList.innerHTML = ''; // Kosongkan daftar tugas yang ada
        const currentFilter = filterSelect.value;
        const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD

        // Filter tugas berdasarkan pilihan dropdown
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            if (currentFilter === 'today') return task.dueDate === today && !task.completed;
            if (currentFilter === 'overdue') return task.dueDate < today && !task.completed && task.dueDate !== '';
            return true;
        });

        if (filteredTasks.length === 0) {
            emptyListMessage.style.display = 'block';
        } else {
            emptyListMessage.style.display = 'none';
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.classList.add('task-item');
                if (task.completed) {
                    li.classList.add('completed');
                }
                if (task.dueDate < today && !task.completed && task.dueDate !== '') {
                    li.classList.add('overdue');
                } else if (task.dueDate === today && !task.completed) {
                    li.classList.add('due-today');
                }

                li.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <div class="task-details">
                        <span class="task-text">${task.text}</span>
                        <span class="task-date">${task.dueDate ? `Due: ${formatDateDisplay(task.dueDate)}` : 'No Due Date'}</span>
                    </div>
                    <div class="task-actions">
                        <button class="edit-task-btn" data-id="${task.id}" title="Edit Task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-task-btn" data-id="${task.id}" title="Delete Task">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                taskList.appendChild(li);
            });
        }
    }

    // 4. Mengubah status completed/pending
    function toggleComplete(id) {
        const taskIndex = tasks.findIndex(task => task.id == id);
        if (taskIndex > -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
        }
    }

    // 5. Mengedit tugas
    function editTask(id) {
        const taskIndex = tasks.findIndex(task => task.id == id);
        if (taskIndex > -1) {
            let newText = prompt("Edit tugas:", tasks[taskIndex].text);
            if (newText !== null && newText.trim() !== "") {
                tasks[taskIndex].text = newText.trim();
                saveTasks();
            }
        }
    }

    // 6. Menghapus tugas
    function deleteTask(id) {
        if (confirm("Yakin ingin menghapus tugas ini?")) {
            tasks = tasks.filter(task => task.id != id);
            saveTasks();
        }
    }

    // 7. Menghapus semua tugas
    function deleteAllTasks() {
        if (confirm("Anda yakin ingin menghapus SEMUA tugas? Aksi ini tidak bisa dibatalkan!")) {
            tasks = [];
            saveTasks();
        }
    }

    // 8. Fungsi pembantu untuk format tanggal tampilan
    function formatDateDisplay(dateString) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // --- EVENT LISTENERS ---

    // Tombol Add Task
    addTaskBtn.addEventListener('click', addTask);

    // Enter key di input teks
    taskTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Delegasi Event untuk tombol-tombol di daftar tugas (checkbox, edit, delete)
    taskList.addEventListener('click', (e) => {
        const target = e.target;
        const taskId = target.dataset.id || target.closest('button')?.dataset.id || target.closest('input[type="checkbox"]')?.dataset.id;

        if (!taskId) return; // Keluar jika tidak ada ID tugas

        if (target.classList.contains('task-checkbox') || target.closest('.task-checkbox')) {
            toggleComplete(taskId);
        } else if (target.classList.contains('edit-task-btn') || target.closest('.edit-task-btn')) {
            editTask(taskId);
        } else if (target.classList.contains('delete-task-btn') || target.closest('.delete-task-btn')) {
            deleteTask(taskId);
        }
    });

    // Dropdown Filter
    filterSelect.addEventListener('change', renderTasks);

    // Tombol Delete All
    deleteAllBtn.addEventListener('click', deleteAllTasks);

    // Inisialisasi: Render tugas saat pertama kali halaman dimuat
    renderTasks();
});
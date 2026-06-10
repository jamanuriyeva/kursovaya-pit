const API_URL = '/api';  // Проксируется через Nginx

let notes = [];

// Загрузка заметок
async function loadNotes() {
    try {
        const response = await fetch(`${API_URL}/notes`);
        notes = await response.json();
        renderNotes();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        document.getElementById('notes-list').innerHTML = '<div class="loading">Ошибка загрузки заметок</div>';
    }
}

// Отображение заметок
function renderNotes() {
    const container = document.getElementById('notes-list');
    if (notes.length === 0) {
        container.innerHTML = '<div class="loading">Нет заметок. Создайте первую!</div>';
        return;
    }
    
    container.innerHTML = notes.map(note => `
        <div class="note-card" data-id="${note.id}">
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.content || '').substring(0, 200)}</p>
            <div class="note-date">${new Date(note.created_at).toLocaleString('ru-RU')}</div>
            <div class="card-buttons">
                <button class="btn-edit" onclick="editNote(${note.id})">✏️ Редактировать</button>
                <button class="btn-delete" onclick="deleteNote(${note.id})">🗑️ Удалить</button>
            </div>
        </div>
    `).join('');
}

// Создание заметки
async function createNote(title, content) {
    const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
    });
    if (response.ok) {
        await loadNotes();
        return true;
    }
    return false;
}

// Обновление заметки
async function updateNote(id, title, content) {
    const response = await fetch(`${API_URL}/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
    });
    if (response.ok) {
        await loadNotes();
        return true;
    }
    return false;
}

// Удаление заметки
async function deleteNote(id) {
    if (confirm('Удалить заметку?')) {
        await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE' });
        await loadNotes();
    }
}

// Редактирование (заполнение формы)
async function editNote(id) {
    const response = await fetch(`${API_URL}/notes/${id}`);
    const note = await response.json();
    
    document.getElementById('form-title').textContent = 'Редактирование заметки';
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').value = note.content || '';
    document.getElementById('edit-id').value = note.id;
    document.getElementById('cancel-btn').style.display = 'inline-block';
}

// Сброс формы
function resetForm() {
    document.getElementById('form-title').textContent = 'Новая заметка';
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    document.getElementById('edit-id').value = '';
    document.getElementById('cancel-btn').style.display = 'none';
}

// Обработчик сохранения
document.getElementById('save-btn').addEventListener('click', async () => {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value;
    const editId = document.getElementById('edit-id').value;
    
    if (!title) {
        alert('Введите заголовок');
        return;
    }
    
    if (editId) {
        await updateNote(editId, title, content);
        resetForm();
    } else {
        await createNote(title, content);
        resetForm();
    }
});

document.getElementById('cancel-btn').addEventListener('click', resetForm);

// Защита от XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Загрузка при старте
loadNotes();
import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://127.0.0.1:8000/api/tasks/';

const quotes = [
  { en: '"My god, My universe"', author: '- Mizi' },
  { en: '"That’s right! Still gay! Emma Lane is a Lesbian!!"', author: '- Emma Lane' },
  { en: '"If I’m not the person you thought I was, and you’re not the person I thought you were, maybe we could start over again right now?"', author: '- Sasakoi' },
  { en: '"I won’t let go of you ever again. I’ll stay by your side forever. If you don’t love me... No, you can’t not love me."', author: '- Love Curse: Find Your Soulmate' },
];

const ANIME_IMAGE_SRC = '/mciris.png';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));
  const [imgLoaded, setImgLoaded] = useState(false);
  const quote = quotes[quoteIndex];

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle, is_completed: newTaskStatus }),
      });
      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
        setNewTaskTitle('');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const response = await fetch(`${API_URL}${task.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: !task.is_completed }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };

  const deleteTask = async (e, taskId) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_URL}${taskId}/`, { method: 'DELETE' });
      if (response.ok || response.status === 204) {
        setTasks(tasks.filter((t) => t.id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="app-wrapper">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1 className="logo-jp">HIMEJOSHI</h1>
          <p className="logo-en">✦ TASK MANAGER ✦</p>
        </div>
        <div className="anime-picture-box">
          {ANIME_IMAGE_SRC && !imgLoaded === false ? null : null}
          {ANIME_IMAGE_SRC ? (
            <img
              src={ANIME_IMAGE_SRC}
              alt="Anime"
              className="anime-picture-img"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(false)}
            />
          ) : (
            <div className="anime-picture-placeholder">
              <span className="placeholder-icon">🖼</span>
              <p>Your Anime Picture</p>
              <small>(Change me!)</small>
            </div>
          )}
        </div>

        <div className="sidebar-quote">
          <p className="quote-en">{quote.en}</p>
          <p className="quote-author">{quote.author}</p>
        </div>

        <div className="sidebar-mascot">
          <div className="mascot-placeholder">✦</div>
        </div>

        <div className="sidebar-petals">
          {[...Array(6)].map((_, i) => (
            <span key={i} className={`petal petal-${i}`}>🌸</span>
          ))}
        </div>
      </aside>

      <main className="main-content">
        <div className="bg-character" aria-hidden="true" />
        <section className="section-card">
          <div className="section-header">
            <span className="section-icon">🌺</span>
            <div>
              <h2 className="section-title">Add New Task</h2>
              <p className="section-subtitle">Create new task for the Himejoshis</p>
            </div>
          </div>
          <div className="section-divider" />

          <form onSubmit={addTask} className="add-task-form">
            <div className="input-wrapper">
              <span className="input-star">✦</span>
              <input
                type="text"
                className="task-input"
                placeholder="Enter your task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
              />
            </div>
            <div className="status-select-wrapper">
              <span className="select-icon">✅</span>
              <select
                className="status-select"
                value={newTaskStatus ? 'true' : 'false'}
                onChange={(e) => setNewTaskStatus(e.target.value === 'true')}
              >
                <option value="false">Not Completed</option>
                <option value="true">Completed</option>
              </select>
              <span className="select-chevron">▾</span>
            </div>
            <button type="submit" className="add-btn">
              <span className="add-btn-icon">✦</span> Add Task
            </button>
          </form>
        </section>
        <section className="section-card tasks-section">
          <div className="section-header">
            <span className="section-icon">📋</span>
            <div>
              <h2 className="section-title">Your Tasks</h2>
              <p className="section-subtitle">Manage your tasks efficiently</p>
            </div>
          </div>
          <div className="section-divider" />

          <div className="task-list">
            {loading ? (
              <p className="empty-msg">Loading tasks from the database...</p>
            ) : tasks.length === 0 ? (
              <p className="empty-msg">No tasks yet. Add one above!</p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-row ${task.is_completed ? 'task-done' : ''}`}
                  onClick={() => toggleComplete(task)}
                >
                  <span className="task-row-icon">✦</span>
                  <span className={`task-row-title ${task.is_completed ? 'strikethrough' : ''}`}>
                    {task.title}
                  </span>
                  <span className={`task-status-badge ${task.is_completed ? 'badge-done' : 'badge-pending'}`}>
                    {task.is_completed ? (
                      <><span className="badge-dot">✓</span> Completed</>
                    ) : (
                      <><span className="badge-dot-empty" /> Not Completed</>
                    )}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={(e) => deleteTask(e, task.id)}
                    title="Delete task"
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
        <footer className="main-footer">
          <span className="footer-shuriken">✦</span>
          <span className="footer-en">"A Yuri a day keeps the straight men away!"</span>
          <span className="footer-shuriken">✦</span>
        </footer>
      </main>
    </div>
  );
}

export default App;

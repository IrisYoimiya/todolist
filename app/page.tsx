"use client";

import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [titleInput, setTitleInput] = useState("");

  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const res = await fetch("/api/tasks");
    const json = await res.json();
    setTasks(json.data);
    setLoading(false);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!titleInput) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleInput }),
    });

    setTitleInput("");
    loadTasks();
  }

  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  }

  async function toggleTask(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: !task.isCompleted }),
    });

    loadTasks();
  }

  function startEdit(task: Task) {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  }

  async function saveEdit() {
    if (!editId) return;

    await fetch(`/api/tasks/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
      }),
    });

    setEditId(null);
    loadTasks();
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Task Manager</h1>

      <form onSubmit={addTask} className="flex gap-2 mb-6">
        <input
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          className="border p-2 flex-1"
          placeholder="Tulis task..."
        />
        <button className="bg-blue-600 text-white px-4">Tambah</button>
      </form>

      {loading && <p>Loading...</p>}

      {tasks.map((task) => (
        <div key={task.id} className="border p-3 mb-3">
          {editId === task.id ? (
            <>
              <input
                className="border p-2 w-full mb-2"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <textarea
                className="border p-2 w-full mb-2"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <button onClick={saveEdit}>Simpan</button>
            </>
          ) : (
            <>
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => toggleTask(task)}
              />
              <span
                style={{
                  marginLeft: 8,
                  textDecoration: task.isCompleted ? "line-through" : "none",
                  cursor: "pointer",
                }}
              >
                {task.title}
              </span>
              <button 
              onClick={() => startEdit(task)}
              style={{ marginLeft: 10 }}>
                Edit
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                style={{ marginLeft: 10 }}
              >
                Hapus
              </button>
            </>
          )}
        </div>
      ))}
    </main>
  );
}

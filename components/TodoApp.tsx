"use client";

import { useState, useEffect } from "react";
import { Todo } from "@/types";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/todos`);
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
        // Save to localStorage for offline access
        localStorage.setItem("todo-cache", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to fetch todos, loading from cache...", error);
      // Fallback to cache if offline
      const cached = localStorage.getItem("todo-cache");
      if (cached) {
        setTodos(JSON.parse(cached));
      }
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, completed: false }),
      });
      if (res.ok) {
        const newTodo = await res.json();
        setTodos([...todos, newTodo]);
        setInput("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id: string) => {
    const oldTodos = [...todos];
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      await fetch(`${apiUrl}/todos/${id}`, { method: "PUT" });
    } catch (error) {
        setTodos(oldTodos);
    }
  };

  const deleteTodo = async (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        await fetch(`${apiUrl}/todos/${id}`, { method: "DELETE" });
    } catch (error) {
        fetchTodos();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
      <div className="p-8">
        <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-center">
          Todo List
        </h1>
        
        <form onSubmit={addTodo} className="flex gap-3 mb-8">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400 text-gray-700"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-600 text-white px-5 py-3 rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 font-semibold"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </form>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {todos.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p>No tasks yet. Start by adding one!</p>
            </div>
          )}
          {todos.map((todo) => (
            <div 
              key={todo.id} 
              className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                todo.completed 
                  ? 'bg-gray-50/50' 
                  : 'bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_-10px_rgba(0,0,0,0.15)] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    todo.completed 
                      ? 'bg-green-500 border-green-500 scale-110' 
                      : 'border-gray-300 hover:border-indigo-500'
                  }`}
                >
                  {todo.completed && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className={`text-lg truncate select-none transition-all duration-300 ${
                  todo.completed 
                    ? 'text-gray-400 line-through decoration-gray-300' 
                    : 'text-gray-700 font-medium'
                }`}>
                  {todo.text}
                </span>
              </div>
              <button 
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-2 transition-all duration-200 transform hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

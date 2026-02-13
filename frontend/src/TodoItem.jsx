import './App.css'
import { useState } from 'react'



function TodoItem({todo, toggleDone, deleteTodo, addNewComment}) {
    const [newComment, setNewComment] = useState("");
  return (
    <li>
        <span className={todo.done ? "done" : ""}>{todo.title}</span>
        <button onClick={() => {toggleDone(todo.id)}}>Toggle</button>
        <button onClick={() => {deleteTodo(todo.id)}}>❌</button>
        {(todo.comments) && (todo.comments.length > 0) && (
        <>
            // ละไว้
        </>
        )}
        <div className="new-comment-forms">
        <input
          type="text"

          // แก้บรรทัดด้านล่าง
          value={newComment}     // ของเก่าเป็น value={newComments[todo.id] || ""}


          onChange={(e) => {
            const value = e.target.value;

            // แก้บรรทัดด้านล่าง
            setNewComment(value);    // ของเดิม: setNewComments({ ...newComments, [todo.id]: value });
          }}
        />
        <button onClick={() => {
            addNewComment(todo.id, newComment);
            setNewComment("");
        }}>Add Comment</button>
      </div>
    </li>
  )
}

export default TodoItem
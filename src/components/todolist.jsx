import { useState, useRef } from "react";

const TodoList = () => {
    const [todo, setTodo] = useState(['123', 'bsd'])

    const todo_now = useRef("")
    function add_todo() {
        let new_todo = todo_now.current.value.trim()
        if (new_todo != "") {
            setTodo([...todo, new_todo])
        }
        todo_now.current.value = ""
    }
    function del_todo(e) {
        let del_index = e.target.dataset.key
        let fix_data = [...todo]
        fix_data.splice(del_index, 1)
        setTodo(fix_data)
    }

    return (
        <>
            <div id="todo_add">
                <input type="text" ref={todo_now} onKeyDown={(e) => { if (e.keyCode == 13) { add_todo() } }} />
                <button onClick={add_todo}>新增</button>

            </div>

            <table id="todo_table">
                <thead>
                    <th style={{ width: "5%" }}></th>
                    <th style={{ width: "80%" }}>內容</th>
                    <th style={{ width: "10%" }}>功能</th>
                </thead>

                {todo.map(function (data, index) {
                    return (
                        <tr className="todo_cell" key={index}>
                            <td></td>
                            <td>
                                {data}
                            </td>
                            <td>
                                <button onClick={(e) => { del_todo(e) }} data-key={index}>刪除</button>
                            </td>

                        </tr>
                    )
                })}
            </table>
        </>

    )
}
export default TodoList;

import Count_text from './components/count_text'
import Weather from './components/weather'
import TodoList from './components/todolist'
import Tic_Tac_Toe from './components/tic_tac_toe'
import Color_game from './components/color_game'
import Leetcode from './components/leetcode_page'
import Sort_build from './components/sort_build'


// import { Provider } from 'react-redux'
import { createContext } from "react";
export const AllData = createContext(null)

import './all.scss'
import {
  Routes,
  Route,
  Link,
} from 'react-router-dom'
import { useState } from 'react'

function App() {
  const [nowShow, setNowShow] = useState("綜合頁面")
  function Home() {
    return (
      <>
        <div>主要想整合多個功能的頁面、建構中</div>
        <p>redux嘗試紀錄各頁信息</p>
      </>
    )
  }
  // function Wrong() {
  //   return (
  //     <>
  //       <div>wrong page</div>
  //     </>
  //   )
  // }


  return (
    <>
      <header>
        <h1>{nowShow}</h1>
      </header>


      <div id='content'>
        <div id='menu'>

          <li style={{ paddingBottom: "10px" }} >
            <Link to='/count_text'>Count Text </Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/weather'>Weather</Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/todolist'>TodoList</Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/tic_tac_toe'>Tic-Tac-Toe</Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/color_game'>Color Game</Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/leetcode_page'>Leetcode</Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/sort_build'>Sort Build</Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/'>回到首頁</Link>
          </li>

        </div>
        <AllData.Provider value={{ setNowShow }}>

          <div id='show_content'>
            <Routes>
              <Route index element={<Home />} />
              <Route path='count_text' element={<Count_text />} />
              <Route path='weather' element={<Weather />} />
              <Route path='todolist' element={<TodoList />} />
              <Route path='tic_tac_toe' element={<Tic_Tac_Toe />} />
              <Route path='color_game' element={<Color_game />} />
              <Route path='leetcode_page' element={<Leetcode />} />
              <Route path='sort_build' element={<Sort_build />} />

              <Route path='*' element={<Home />} />
            </Routes>
            {/* <Count_text /> */}
          </div>

        </AllData.Provider>


      </div>
    </>
  )
}

export default App

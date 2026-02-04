
import Count_text from './components/count_text'
import Weather from './components/weather'
import TodoList from './components/todolist'
import Tic_Tac_Toe from './components/tic_tac_toe'
import Color_game from './components/color_game'
import Leetcode from './components/leetcode_page'
import CounterPage from './components/CounterPage'
import LolMatches from './components/LolMatches'
import LineStickerCropper from './components/LineStickerCropper';


import { useSelector, useDispatch } from 'react-redux'

import './all.scss'
import {
  Routes,
  Route,
  Link,
  useLocation
} from 'react-router-dom'
import { useEffect } from 'react'
import { setPageTitle } from './store/headerSlice'

function App() {
  const nowShow = useSelector((state) => state.header.title)
  const dispatch = useDispatch()
  const location = useLocation()

  const pageTitles = {
    '/': '綜合頁面',
    '/count_text': '字數計算',
    '/weather': '天氣',
    '/todolist': '待辦事項',
    '/tic_tac_toe': '井字遊戲',
    '/color_game': '顏色遊戲',
    '/leetcode_page': 'LeetCode 練習',
    '/counter_page': '卡厄斯pt計算',
    '/lol_matches': '英雄聯盟賽事',
    '/line_sticker_cropper': 'LINE貼圖切割'
  }

  useEffect(() => {
    const currentPath = location.pathname
    const newTitle = pageTitles[currentPath] || '綜合頁面'
    dispatch(setPageTitle(newTitle))
  }, [location, dispatch])

  function Home() {
    return (
      <>
        <div>主要想整合多個功能的頁面、建構中</div>
        <p>redux嘗試紀錄各頁信息</p>
      </>
    )
  }

  return (
    <>
      <header>
        <h1>{nowShow}</h1>
      </header>

      <div id='content'>
        <div id='menu'>

          <li style={{ paddingBottom: "10px" }} >
            <Link to='/count_text'>字數計算</Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/weather'>天氣</Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/todolist'>待辦清單</Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/tic_tac_toe'>井字遊戲</Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/color_game'>顏色遊戲</Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/leetcode_page'>Leetcode</Link>
          </li>

          <li style={{ paddingBottom: "10px" }}>
            <Link to='/counter_page'>卡厄斯pt計算</Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/lol_matches'>LOL近期賽事</Link> 
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/line_sticker_cropper'>LINE貼圖切割</Link>
          </li>
          <li style={{ paddingBottom: "10px" }}>
            <Link to='/'>回到首頁</Link>
          </li>

        </div>

        <div id='show_content'>
          <Routes>
            <Route index element={<Home />} />
            <Route path='count_text' element={<Count_text />} />
            <Route path='weather' element={<Weather />} />
            <Route path='todolist' element={<TodoList />} />
            <Route path='tic_tac_toe' element={<Tic_Tac_Toe />} />
            <Route path='color_game' element={<Color_game />} />
            <Route path='leetcode_page' element={<Leetcode />} />
            <Route path='counter_page' element={<CounterPage />} />
            <Route path='lol_matches' element={<LolMatches />} /> 
            <Route path='line_sticker_cropper' element={<LineStickerCropper />} />

            <Route path='*' element={<Home />} />
          </Routes>
        </div>

      </div>
    </>
  )
}

export default App


import Home from './components/Home.jsx';
import Count_text from './components/count_text.jsx';
import Weather from './components/weather.jsx';
import TodoList from './components/todolist.jsx';
import Tic_Tac_Toe from './components/tic_tac_toe.jsx';
import Color_game from './components/color_game.jsx';
import Leetcode from './components/leetcode_page.jsx';
import CounterPage from './components/CounterPage.jsx';
import LolMatches from './components/LolMatches.jsx';
import LineStickerCropper from './components/LineStickerCropper.jsx';

export const pageRoutes = [
  {
    path: '/count_text',
    name: '字數計算',
    title: '字數計算',
    element: <Count_text />,
  },
  {
    path: '/weather',
    name: '天氣',
    title: '天氣',
    element: <Weather />,
  },
  {
    path: '/todolist',
    name: '待辦清單',
    title: '待辦事項',
    element: <TodoList />,
  },
  {
    path: '/tic_tac_toe',
    name: '井字遊戲',
    title: '井字遊戲',
    element: <Tic_Tac_Toe />,
  },
  {
    path: '/color_game',
    name: '顏色遊戲',
    title: '顏色遊戲',
    element: <Color_game />,
  },
  {
    path: '/leetcode_page',
    name: 'Leetcode',
    title: 'LeetCode 練習',
    element: <Leetcode />,
  },
  {
    path: '/counter_page',
    name: '卡厄斯pt計算',
    title: '卡厄斯pt計算',
    element: <CounterPage />,
  },
  {
    path: '/lol_matches',
    name: 'LOL近期賽事',
    title: '英雄聯盟賽事',
    element: <LolMatches />,
  },
  {
    path: '/line_sticker_cropper',
    name: 'LINE貼圖切割',
    title: 'LINE貼圖切割',
    element: <LineStickerCropper />,
  },
  {
    path: '/',
    name: '回到首頁',
    title: '綜合頁面',
    element: <Home />,
    index: true,
  },
];

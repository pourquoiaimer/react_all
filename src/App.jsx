
import { useSelector, useDispatch } from 'react-redux';
import './all.scss';
import {
  Routes,
  Route,
  Link,
  useLocation
} from 'react-router-dom';
import { useEffect } from 'react';
import { setPageTitle } from './store/headerSlice';
import { pageRoutes } from './routes';

function App() {
  const nowShow = useSelector((state) => state.header.title);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const route = pageRoutes.find(r => r.path === currentPath);
    const newTitle = route ? route.title : '綜合頁面';
    dispatch(setPageTitle(newTitle));
  }, [location, dispatch]);

  return (
    <>
      <header>
        <h1>{nowShow}</h1>
      </header>

      <div id='content'>
        <div id='menu'>
          {
            pageRoutes.map(route => (
              <li className='menu-item' key={route.path}>
                <Link to={route.path}>{route.name}</Link>
              </li>
            ))
          }
        </div>

        <div id='show_content'>
          <Routes>
            {
              pageRoutes.map(route => (
                <Route 
                  key={route.path}
                  path={route.path} 
                  element={route.element} 
                  index={route.index}
                />
              ))
            }
            <Route path='*' element={pageRoutes.find(r => r.index).element} />
          </Routes>
        </div>

      </div>
    </>
  );
}

export default App;

import React, { useEffect, useState } from "react"
import './App.css'
import { supabase } from './supabase'

//ant design
import { TabBar } from 'antd-mobile'
import { BankcardOutline, CalendarOutline, UserContactOutline } from 'antd-mobile-icons'

//router
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";

//pages
import Publik from "./pages/Publik";
import Setoran from "./pages/Setoran";
import Periode from "./pages/Periode";
import Peserta from "./pages/Peserta";

function App() {
  const [appTitle, setAppTile] = useState('Arisan TIP 2025')

  //auth
  const [session, setSession] = useState(null)
  useEffect(() => {
    document.title = appTitle;

    supabase.auth.getSession().then(async({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])
  
  //tab admin
  const TabAdmin = () => {
    const navigate = useNavigate();
    const location = useLocation()
    const { pathname } = location

    const setRouteActive = (value) => {
      //get app title
      tabList.map(tabRow =>{
        if(tabRow.key === value)
          setAppTile(tabRow.title)
      })
      
      navigate(value)
    }
    
    const tabList = [
      {
        key: '/',
        title: 'Setoran',
        icon: <BankcardOutline />
      },
      {
        key: '/periode',
        title: 'Periode',
        icon: <CalendarOutline />
      },
      {
        key: '/peserta',
        title: 'Peserta',
        icon: <UserContactOutline />
      },
    ];
  
    return (
      <TabBar activeKey={pathname} onChange={value => setRouteActive(value)}>
        {tabList.map(item => (
          <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
        ))}
      </TabBar>
    )
  }

  return (
    <BrowserRouter>
      {session ?
        
        <div style={{ height:(window.innerHeight-10), display:'flex', flexDirection:'column' }}>
          <div className="body">
            <Routes>
              <Route exact path='/' element={<Setoran />} />
              <Route exact path='/periode' element={<Periode />} />
              <Route exact path='/peserta' element={<Peserta />} />
            </Routes>
          </div>
          <div className="bottom">
            <TabAdmin />
          </div>
        </div>
      :
        <Publik />
      }
    </BrowserRouter>
  );
}

export default App;

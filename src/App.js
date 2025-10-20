import React, { useEffect, useState } from "react"
import './App.css'
import { supabase } from './supabase'

//ant design
import { NavBar, TabBar, Form, Input, Button, Toast } from 'antd-mobile'
import { EditSOutline, BankcardOutline, StopOutline, EyeOutline, UserContactOutline } from 'antd-mobile-icons'

//router
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";

//pages
import PertemuanList from "./admin/PertemuanList";
import PertemuanInsert from "./admin/PertemuanInsert";
import PertemuanUpdate from "./admin/PertemuanUpdate";
import PembayaranList from "./admin/PembayaranList";
import PembayaranDetail from "./admin/PembayaranDetail";
import PembayaranDetailInsert from "./admin/PembayaranDetailInsert";
import KelasList from "./admin/KelasList";
import KelasInsert from "./admin/KelasInsert";
import KelasUpdate from "./admin/KelasUpdate";
import KelasPesertaList from "./admin/KelasPesertaList";
import KelasPesertaInsert from "./admin/KelasPesertaInsert";

import Kehadiran from "./member/Kehadiran";
import Pembayaran from "./member/Pembayaran";

function App() {
  const [appTitle, setAppTile] = useState('Kehadiran')
  const [showPassword, setShowPassword] = useState(false)

  //auth
  const [session, setSession] = useState(null)
  useEffect(() => {
    document.title = 'HMD Academy';

    supabase.auth.getSession().then(async({ data: { session } }) => {
      setSession(session)
      if(session) {
        const { data:data2, error } = await supabase.from("v2_user")
                                .select('is_admin')
                                .eq('email', session.user.email)
                                .single()
        setIsAdmin(data2.is_admin)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])
  
  //login
  const [isLoading, setIsLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  
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
        title: 'Kehadiran',
        icon: <EditSOutline />
      },
      {
        key: '/pembayaran_list',
        title: 'Pembayaran',
        icon: <BankcardOutline />
      },
      {
        key: '/kelas_list',
        title: 'Kelas',
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

  //tab member
  const TabMember = () => {
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
        title: 'Kehadiran',
        icon: <EditSOutline />
      },
      {
        key: '/pembayaran',
        title: 'Pembayaran',
        icon: <BankcardOutline />
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

  const onSignIn = async(input) => {
    setIsLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email: input.email, 
      password: input.password
    })

    if (error) {
      Toast.show({
        content: error.message
      })
    } else {
      const { data } = await supabase.from("v2_user")
                              .select('is_admin')
                              .eq('email', input.email)
                              .single()
      setIsAdmin(data.is_admin)
    }

    setIsLoading(false)
  }

  async function onSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <BrowserRouter>
      {session ?
        <>
        {isAdmin ?
          <div style={{ height:(window.innerHeight-10), display:'flex', flexDirection:'column' }}>
            <div className="body">
              <Routes>
                <Route exact path='/' element={<PertemuanList />} />
                <Route exact path='/pertemuan_update' element={<PertemuanUpdate />} />
                <Route exact path='/pertemuan_insert' element={<PertemuanInsert />} />
                <Route exact path='/pembayaran_list' element={<PembayaranList />} />
                <Route exact path='/pembayaran_detail' element={<PembayaranDetail />} />
                <Route exact path='/pembayaran_detail_insert' element={<PembayaranDetailInsert />} />

                <Route exact path='/kelas_list' element={<KelasList />} />
                <Route exact path='/kelas_insert' element={<KelasInsert />} />
                <Route exact path='/kelas_update' element={<KelasUpdate />} />
                <Route exact path='/kelas_peserta_list' element={<KelasPesertaList />} />
                <Route exact path='/kelas_peserta_insert' element={<KelasPesertaInsert />} />
              </Routes>
            </div>
            <div className="bottom">
              <TabAdmin />
            </div>
          </div>
        :
          <div style={{ height:(window.innerHeight-10), display:'flex', flexDirection:'column' }}>
            <div className="top">
              <NavBar backArrow={false} right={<StopOutline fontSize={23} onClick={() => onSignOut()} />}>
              {appTitle}
              </NavBar>
            </div>
            <div className="body">
              <Routes>
                <Route exact path='/' element={<Kehadiran />} />
                <Route exact path='/pembayaran' element={<Pembayaran />} />
              </Routes>
            </div>
            <div className="bottom">
              <TabMember />
            </div>
          </div>
        }
        </>
      :
        <Form 
          layout='horizontal'
          onFinish={onSignIn}
          footer={
            <Button loading={isLoading} color='primary' fill='solid' block type='submit'>
              Login
            </Button>
          }
        >
          <Form.Header><span style={{fontSize:20 }}>HMD Academy</span></Form.Header>
          <Form.Item name='email' rules={[{ required:true, type:'email', message:'Wajib diisi' }]}>
            <Input placeholder='Email' />
          </Form.Item>
          <Form.Item name='password' rules={[{ required:true, min:6, message:'Wajib diisi' }]} extra={<EyeOutline onClick={() => setShowPassword(!showPassword)} />}>
            <Input placeholder='Password' type={showPassword ? 'text ' : 'password'} />
          </Form.Item>
        </Form>
      }
    </BrowserRouter>
  );
}

export default App;

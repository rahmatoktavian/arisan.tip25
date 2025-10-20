import React, { useState } from "react"
import { NavBar, Form, Input, Button, Toast, SpinLoading } from 'antd-mobile'
import { useNavigate, useLocation } from "react-router-dom"
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../supabase'

export default function KelasPesertaInsert() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [email, setEmail] = useState('');
  const [nama, setNama] = useState('');
  const [telpon, setTelpon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [institusi, setInstitusi] = useState('');

  async function onSave(input) {
    Toast.show({ content: (<SpinLoading />) })
    
    const { error } = await supabase.auth.signUp({ 
      email: input.email, 
      password: input.password
    })
    
    if(!error) {
      const peserta_id = uuidv4();

      //insert pertemuan
      const {error} = await supabase.from("v2_peserta").insert({
        id: peserta_id,
        kelas_id: state.kelas_id,
        email: input.email,
        nama: input.nama,
        telpon: input.telpon,
        alamat: input.alamat,
        institusi: input.institusi,
      })
      
      Toast.clear()
      navigate('/kelas_peserta_list', {state} )
    }
  }

  return (
    <>
      <NavBar onBack={() => navigate('/kelas_peserta_list', {state} )}>
        {state.kelas_nama}
      </NavBar>

      <Form 
        name='form'
        layout='horizontal' 
        onFinish={onSave}
        footer={
          <Button block type='submit' color='primary' size='large'>Simpan</Button>
        }
      >
        <Form.Item name='email' rules={[{ required:true, type:'email', message:'Wajib diisi' }]}>
          <Input placeholder='Email' />
        </Form.Item>
        <Form.Item name='password' rules={[{ required:true, min:6, message:'Wajib diisi' }]}>
          <Input placeholder='Password' type='password' />
        </Form.Item>
        <Form.Item name='nama' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Nama' />
        </Form.Item>
        <Form.Item name='telpon' rules={[{ required: true, message: 'Wajib diisi' }]}>
          <Input placeholder='Telpon' />
        </Form.Item>
        <Form.Item name='alamat' rules={[{ required: true, message: 'Wajib diisi' }]}>
          <Input placeholder='Alamat' />
        </Form.Item>
        <Form.Item name='institusi' rules={[{ required: true, message: 'Wajib diisi' }]}>
          <Input placeholder='Institusi' />
        </Form.Item>
      </Form>
    </>
  );
}
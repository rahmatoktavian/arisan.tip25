import React, { useState } from "react"
import { NavBar, Form, Input, Button, Toast, SpinLoading } from 'antd-mobile'
import { useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../supabase'

export default function KelasInsert() {
  const navigate = useNavigate();

  async function onSave(input) {
    Toast.show({ content: (<SpinLoading />) })
    
    const kelas_id = uuidv4();

    //insert pertemuan
    await supabase.from("v2_kelas").insert({
      id: kelas_id,
      nama: input.nama,
      topik: input.topik,
      pertemuan: input.pertemuan,
      biaya: input.biaya,
    })

    Toast.clear()
    navigate('/kelas_list')
  }

  return (
    <>
      <NavBar onBack={() => navigate('/kelas_list')}>
        Tambah Kelas
      </NavBar>

      <Form 
        name='form'
        layout='horizontal'
        onFinish={onSave}
        footer={
          <Button block color='primary' type='submit'>Simpan</Button>
        }
      >
        <Form.Item name='nama' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Nama' />
        </Form.Item>
        <Form.Item name='topik' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Topik' />
        </Form.Item>
        <Form.Item name='pertemuan' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Pertemuan' />
        </Form.Item>
        <Form.Item name='biaya' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Biaya' />
        </Form.Item>
      </Form>
    </>
  );
}
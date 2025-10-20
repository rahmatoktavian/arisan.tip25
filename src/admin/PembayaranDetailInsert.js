import React from "react"
import { NavBar, Form, Input, Button, Toast, SpinLoading } from 'antd-mobile'
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from '../supabase'

export default function PembayaranDetailInsert() {
  const navigate = useNavigate();
  let { state } = useLocation();

  async function onSave(input) {
    Toast.show({ content: (<SpinLoading />) })
    
    const { error } = await supabase.from("v2_pembayaran").insert({
      kelas_id: state.kelas_id,
      peserta_id: state.peserta_id,
      nominal: input.nominal,
      tanggal: input.tanggal,
      keterangan: input.keterangan,
    })

    Toast.clear()
    navigate('/pembayaran_detail', { state })
  }

  return (
    <>
      <NavBar onBack={() => navigate('/pembayaran_detail', { state })}>
        {state.peserta_nama}
      </NavBar>

      <Form 
        layout='horizontal'
        onFinish={onSave}
        footer={
          <Button block color='primary' type='submit'>Simpan</Button>
        }
      >
        <Form.Item name='nominal' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Nominal' />
        </Form.Item>
        <Form.Item name='tanggal' rules={[{ required:true, type:'date', message:'Wajib diisi' }]}>
          <Input placeholder='Tanggal' type='date' />
        </Form.Item>
        <Form.Item name='keterangan' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Keterangan' />
        </Form.Item>
      </Form>
    </>
  );
}
import React, { useEffect, useState } from "react"
import { NavBar, List, Switch, Form, Input, Button, Toast, SpinLoading } from 'antd-mobile'
import { useNavigate, useLocation } from "react-router-dom"
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../supabase'

export default function PertemuanInsert() {
  const navigate = useNavigate();
  let { state } = useLocation();
  
  const [dataList, setDataList] = useState('');

  useEffect(() => {
    getDataList();
  }, []);

  async function getDataList() {
    Toast.show({ content: (<SpinLoading />) })

    //peserta
    const { data } = await supabase.from("v2_peserta")
                              .select('id, nama')
                              .eq('kelas_id', state.kelas_id)
                              .order('nama', { ascending: false })
  
    let pesertaList = [];
    if(data.length > 0) {
      data.map((row, idx) => {
        pesertaList.push({
          peserta_id: row.id, 
          nama: row.nama, 
          status: false,
        })
      })
      setDataList(pesertaList)
    }

    Toast.clear()
  }

  function changeStatus(idx, value) {
    let newDataList = [...dataList];
    newDataList[idx].status = value;
    setDataList(newDataList)
  }

  async function onSave(input) {
    Toast.show({ content: (<SpinLoading />) })
    
    const pertemuan_id = uuidv4();

    //insert pertemuan
    const {error} = await supabase.from("v2_pertemuan").insert({
      id: pertemuan_id,
      kelas_id: state.kelas_id,
      urutan: input.urutan,
      tanggal: input.tanggal,
      materi: input.materi,
    })
    
    //insert peserta kehadiran
    let kehadiranList = []
    dataList.map((row, idx) => {
      kehadiranList.push({
        kelas_id: state.kelas_id,
        pertemuan_id: pertemuan_id,
        peserta_id: row.peserta_id, 
        status: row.status
      })
    })
    const { error:error2 } = await supabase.from("v2_peserta_kehadiran").insert(kehadiranList)

    Toast.clear()
    navigate('/', {state})
  }

  return (
    <>
      <NavBar onBack={() => navigate('/', {state} )}>
        Tambah Pertemuan
      </NavBar>
      <Form 
        layout='horizontal'
        onFinish={onSave}
        footer={
          <Button block color='primary' type='submit'>Simpan</Button>
        }
      >
        <Form.Item name='urutan' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Urutan' />
        </Form.Item>
        <Form.Item name='tanggal' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Tanggal' type='date' />
        </Form.Item>
        <Form.Item name='materi' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Materi' />
        </Form.Item>
        <Form.Item>
          <List header='Peserta' style={{marginTop:20}}>
            {dataList && dataList.map((row, idx) =>
            <List.Item 
              key={idx}
              prefix={<Switch checked={row.status} onChange={(value) => changeStatus(idx, value)} />}
            >
              {row.nama}
            </List.Item>
            )}
          </List>
        </Form.Item>
      </Form>
    </>
  );
}
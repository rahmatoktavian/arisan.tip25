import React, { useEffect, useState } from "react"
import { NavBar, List, Form, Input, Switch, Button, Dialog, Toast, SpinLoading } from 'antd-mobile'
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from '../supabase'
import { DeleteOutline } from "antd-mobile-icons";

export default function PertemuanUpdate() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [urutan, setUrutan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [materi, setMateri] = useState('');
  const [dataList, setDataList] = useState([])

  useEffect(() => {
    getDataList();
  }, []);

  async function getDataList() {
    Toast.show({ content: (<SpinLoading />) })

    //pertemuan
    const { data:dataPertemuan } = await supabase.from("v2_pertemuan")
                              .select('urutan, tanggal, materi')
                              .eq('id', state.pertemuan_id)
                              .single();
    
    setUrutan(dataPertemuan.urutan)
    setTanggal(dataPertemuan.tanggal)
    setMateri(dataPertemuan.materi)

    //peserta kehadiran
    const { data:dataKehadiran } = await supabase.from("v2_peserta_kehadiran")
                              .select('peserta_id, status')
                              .eq('pertemuan_id', state.pertemuan_id)
                              .eq('kelas_id', state.kelas_id)
                              
    let pesertaKehadiran = []
    if(dataKehadiran.length > 0) {
      dataKehadiran.map(row => {
        pesertaKehadiran[row.peserta_id] = row.status
      })
    }

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
          status: pesertaKehadiran[row.id] ? pesertaKehadiran[row.id] : false,
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

  async function onSave() {
    Toast.show({ content: (<SpinLoading />) })
    
    //update pertemuan
    await supabase.from("v2_pertemuan").update({
      urutan: urutan,
      tanggal: tanggal,
      materi: materi,
    })
    .eq('id', state.pertemuan_id)

    //delete peserta kehadiran
    await supabase.from("v2_peserta_kehadiran").delete()
        .eq('pertemuan_id', state.pertemuan_id)
        .eq('kelas_id', state.kelas_id)

    //insert peserta kehadiran
    let kehadiranList = []
    dataList.map((row, idx) => {
      kehadiranList.push({
        kelas_id: state.kelas_id,
        pertemuan_id: state.pertemuan_id,
        peserta_id: row.peserta_id, 
        status: row.status
      })
    })

    await supabase.from("v2_peserta_kehadiran").insert(kehadiranList)

    Toast.clear()
    navigate('/', {state})
  }

  function confirmDelete() {
    Dialog.confirm({
      title: "Yakin hapus data!!!",
      cancelText: 'Batal',
      confirmText: 'Hapus',
      onConfirm: async() => {
        Toast.show({ content: (<SpinLoading />) })

        //delete peserta kehadiran
        await supabase.from("v2_peserta_kehadiran").delete()
        .eq('pertemuan_id', state.pertemuan_id)
        .eq('kelas_id', state.kelas_id)

        //delete pertemuan
        await supabase.from("v2_pertemuan").delete()
        .eq('id', state.pertemuan_id)

        Toast.clear()
        navigate('/', {state})
      }
    })
  }

  return (
    <>
      <NavBar onBack={() => navigate('/', {state})} right={<DeleteOutline fontSize={23} onClick={() => confirmDelete()} />}>
        Ubah Pertemuan
      </NavBar>
      <Form layout='horizontal'>
        <Form.Item>
          <Input
            placeholder='Urutan'
            value={urutan}
            onChange={val => setUrutan(val)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder='Tanggal'
            value={tanggal}
            onChange={val => setTanggal(val)}
            type='date'
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder='Materi'
            value={materi}
            onChange={val => setMateri(val)}
          />
        </Form.Item>
      </Form>

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

      <Button block color='primary' onClick={() => onSave()}>Simpan</Button>
    </>
  );
}
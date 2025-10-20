import React, { useEffect, useState } from "react"
import { NavBar, List, Button, Dialog, Toast, SpinLoading } from 'antd-mobile'
import { DeleteOutline } from 'antd-mobile-icons'
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from '../supabase'

export default function PembayaranDetail() {
  const navigate = useNavigate();
  let { state } = useLocation();

  const [dataList, setDataList] = useState([])

  useEffect(() => {
    getDataList();
  }, []);

  async function getDataList() {
    Toast.show({ content: (<SpinLoading />) })
    
    //data
    const { data } = await supabase.from("v2_pembayaran")
                              .select('id, tanggal, nominal, keterangan')
                              .eq('peserta_id', state.peserta_id)
                              .order('tanggal')

    setDataList(data)
    Toast.clear()
  }

  function confirmDelete(id) {
    Dialog.confirm({
      title: "Yakin hapus data!!!",
      cancelText: 'Batal',
      confirmText: 'Hapus',
      onConfirm: async() => {
        Toast.show({ content: (<SpinLoading />) })
        
        await supabase.from("v2_pembayaran").delete()
        .eq('id', id)

        Toast.clear()
        getDataList()
      }
    })
  }

  return (
    <>
      <NavBar onBack={() => navigate('/pembayaran_list', { state })}>
        {state.peserta_nama}
      </NavBar>
      <List>
      {dataList && dataList.map((row, idx) =>
        <List.Item 
          key={idx}
          prefix={<Button size='mini' shape='rounded' color='primary' fill='outline'>{idx+1}</Button>} 
          description={row.tanggal+' [Note: '+row.keterangan+']'}
          extra={<DeleteOutline onClick={() => confirmDelete(row.id)} />}
        >
          {row.nominal}
        </List.Item>
        )}
      </List>

      <Button color='primary' fill='solid' block onClick={() => navigate('/pembayaran_detail_insert', { state } ) }>
        Tambah Pembayaran
      </Button>
    </>
  );
}
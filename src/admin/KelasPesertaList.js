import React, { useEffect, useState } from "react"
import { NavBar, List, Button, Toast, SpinLoading, Dialog } from 'antd-mobile'
import { DeleteOutline } from 'antd-mobile-icons'
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from '../supabase'

export default function KelasPeseraList() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    getDataList();
  }, []);

  async function getDataList() {
    Toast.show({ content: (<SpinLoading />) })

    //data
    const { data } = await supabase.from("v2_peserta")
                              .select('id, nama, telpon')
                              .eq('kelas_id', state.kelas_id)
                              .order('nama', { ascending: false })
    setDataList(data)

    Toast.clear()
  }

  async function confirmDelete(id) {
    Dialog.confirm({
      title: "Yakin hapus data!!!",
      cancelText: 'Batal',
      confirmText: 'Hapus',
      onConfirm: async() => {
        Toast.show({ content: (<SpinLoading />) })

        await supabase.from("v2_peserta").delete()
        .eq('id', id)

        Toast.clear()
        getDataList()
      }
    })
  }

  return (
    <>
      <NavBar onBack={() => navigate('/kelas_list')}>
        {state.kelas_nama}
      </NavBar>

      <List>
      {dataList && dataList.map((row, idx) =>
        <List.Item 
          key={idx} 
          extra={<DeleteOutline onClick={() => confirmDelete(row.id)} />}
          description={row.telpon}
        >
          {row.nama}
        </List.Item>
        )}
      </List>

      <Button color='primary' fill='solid' block onClick={() => navigate('/kelas_peserta_insert', {state} )}>Tambah Peserta</Button>
    </>
  );
}
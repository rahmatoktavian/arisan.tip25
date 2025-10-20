import React, { useEffect, useState } from "react"
import { NavBar, List, Button, Toast, SpinLoading, ActionSheet } from 'antd-mobile'
import { useNavigate } from "react-router-dom";
import { supabase } from '../supabase'

export default function KelasList() {
  const navigate = useNavigate();
  const [dataList, setDataList] = useState([]);
  const [actionShow, setActionShow] = useState(false);
  const [kelasID, setKelasID] = useState(0);
  const [kelasNama, setKelasNama] = useState('');
  
  useEffect(() => {
    getDataList();
  }, []);

  async function getDataList() {
    Toast.show({ content: (<SpinLoading />) })

    //data
    const { data } = await supabase.from("v2_kelas")
                              .select('id, nama, topik')
                              .order('nama', { ascending: false })
    setDataList(data)

    Toast.clear()
  }

  function onClickAction(row) {
    setActionShow(true)
    setKelasID(row.id)
    setKelasNama(row.nama)
  }

  const actionList = [
    { text: 'Peserta', key: 'copy', onClick:() => { navigate('/kelas_peserta_list', { state:{kelas_id:kelasID, kelas_nama:kelasNama} }) } },
    { text: 'Ubah', key: 'edit', onClick:() => { navigate('/kelas_update', { state:{kelas_id:kelasID, kelas_nama:kelasNama} } )} },
  ]

  return (
    <>
      <NavBar backArrow={false}>
        Kelas
      </NavBar>

      <List>
      {dataList && dataList.map((row, idx) =>
        <List.Item 
          key={idx} 
          onClick={() => onClickAction(row)}
          description={row.topik}
        >
          {row.nama}
        </List.Item>
        )}
      </List>

      <ActionSheet
        visible={actionShow}
        actions={actionList}
        onClose={() => setActionShow(false)}
      />

      <Button color='primary' fill='solid' block onClick={() => navigate('/kelas_insert')}>
        Tambah Kelas
      </Button>
    </>
  );
}
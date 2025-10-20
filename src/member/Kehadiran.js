import React, { useEffect, useState } from "react"
import { List, Button, Toast, SpinLoading } from 'antd-mobile'
import { CheckCircleOutline, CloseCircleOutline } from 'antd-mobile-icons'
import { supabase } from '../supabase'

function Kehadiran() {
  const [dataKelas, setDataKelas] = useState('')
  const [dataList, setDataList] = useState([])

  useEffect(() => {
    getDataList();
  }, []);

  async function getDataList() {
    Toast.show({ content: (<SpinLoading />) })

    //user
    const { data: { user } } = await supabase.auth.getUser()

    //data
    const { data } = await supabase.from("v2_peserta_kehadiran")
                              .select('status, v2_pertemuan!inner(tanggal, materi), v2_kelas!inner(nama), v2_peserta!inner(email)')
                              .eq('v2_peserta.email', user.email)
                              .eq('v2_kelas.aktif', true)
    setDataList(data);
    if(data.length > 0)
      setDataKelas(data[0].v2_kelas.nama)

    Toast.clear()
  }

  return (
    <>
      <List header={dataKelas}>
      {dataList && dataList.map((row, idx) =>
        <List.Item 
          key={idx}
          prefix={<Button size='mini' shape='rounded' color='primary' fill='outline'>{idx+1}</Button>} 
          description={row.v2_pertemuan.tanggal}
          extra={row.status ? <CheckCircleOutline fontSize={25} color='var(--adm-color-primary)' /> : <CloseCircleOutline fontSize={25} color='var(--adm-color-danger)' />} 
        >
          {row.v2_pertemuan.materi}
        </List.Item>
        )}
      </List>
    </>
  );
}

export default Kehadiran;
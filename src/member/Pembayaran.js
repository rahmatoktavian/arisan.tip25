import React, { useEffect, useState } from "react"
import { List, Button, Toast, SpinLoading } from 'antd-mobile'
import { supabase } from '../supabase'

function Pembayaran() {
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    getDataList();
  }, []);

  async function getDataList() {
    Toast.show({ content: (<SpinLoading />) })

    //user
    const { data: { user } } = await supabase.auth.getUser()

    //data
    const { data, error } = await supabase.from("v2_pembayaran")
                      .select('tanggal, nominal, v2_peserta!inner(email), v2_kelas!inner(aktif)')
                      .eq('v2_peserta.email', user.email)
                      .eq('v2_kelas.aktif', true)
      
    setDataList(data);

    Toast.clear()
  }

  return (
    <>
      <List>
        {dataList && dataList.map((row, idx) =>
        <List.Item 
          key={idx}
          prefix={<Button size='mini' shape='rounded' color='primary' fill='outline'>{idx+1}</Button>} 
          extra={row.tanggal}
        >
          Rp {row.nominal}
        </List.Item>
        )}
      </List>
    </>
  );
}

export default Pembayaran;
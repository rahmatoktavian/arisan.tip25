import React, { useEffect, useState } from "react"
import { List, Button, Toast, SpinLoading, Picker, NavBar } from 'antd-mobile'
import { StopOutline } from 'antd-mobile-icons'

import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from '../supabase'

export default function PertemuanList() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [kelasID, setKelasID] = useState(false)
  const [pickerView, setPickerView] = useState(false)
  const [pickerList, setPickerList] = useState()
  const [pickerValue, setPickerValue] = useState('')
  const [pickerLabel, setPickerLabel] = useState('')

  const [dataList, setDataList] = useState([])

  useEffect(() => {
    getDataKelas();
  }, []);

  async function getDataKelas() {
    //data
    const { data } = await supabase.from("v2_kelas")
                              .select('id, nama')
                              .order('nama', { ascending: false })
   
    let pickerListVal = [];
    data.map((row, idx) => {
      //picker data
      pickerListVal.push({
        value:row.id, label:row.nama
      })
    })
    setPickerList([pickerListVal])

    //def picker value & label
    if(state) {
      setPickerLabel(state.kelas_nama)
      setPickerValue(state.kelas_id)
      getDataList(state.kelas_id)
      setKelasID(state.kelas_id)
    } else {
      setPickerLabel(data[0].nama)
      setPickerValue(data[0].id)
      getDataList(data[0].id)
      setKelasID(data[0].id)
    }
  }

  async function getDataList(kelas_id) {
    Toast.show({ content: (<SpinLoading />) })

    //data
    const { data, error } = await supabase.from("v2_pertemuan")
                              .select('id, kelas_id, urutan, tanggal, materi')
                              .eq('kelas_id', kelas_id)
                              .order('urutan', {ascending:false})
    setDataList(data)

    Toast.clear()
  }

  const onPickerChange = (value) => {
    setPickerValue(value[0])
    pickerList[0].map(row => {
      if(row.value === value[0]) {
        setPickerLabel(row.label)
      }
    })

    getDataList(value[0])
    setKelasID(value[0])
  }

  async function onSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <>
      <NavBar backArrow={false} right={<StopOutline fontSize={23} onClick={() => onSignOut()} />}>
        Pertemuan
      </NavBar>

      <Button block size='small' fill='outline' color='primary' onClick={() => setPickerView(true)}>{pickerLabel}</Button>
      <Picker
        columns={pickerList}
        visible={pickerView}
        onClose={() => setPickerView(false)}
        value={[pickerValue]}
        onConfirm={value => onPickerChange(value)}
        confirmText='Pilih'
        cancelText='Batal'
      />

      <List style={{ overflow:'auto', height:window.innerHeight*0.75}}>
      {dataList && dataList.map((row, idx) =>
        <List.Item 
          key={idx}
          prefix={<Button size='mini' shape='rounded' color='primary' fill='outline'>{row.urutan}</Button>} 
          description={row.tanggal} 
          onClick={() => navigate('/pertemuan_update', { state:{kelas_id:pickerValue, kelas_nama:pickerLabel, pertemuan_id:row.id} } )}
        >
          {row.materi}
        </List.Item>
        )}
      </List>

      <Button color='primary' fill='solid' block onClick={() => navigate('/pertemuan_insert', { state:{kelas_id:pickerValue, kelas_nama:pickerLabel} }) }>
        Tambah Pertemuan
      </Button>
    </>
  );
}
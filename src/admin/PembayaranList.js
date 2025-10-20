import React, { useEffect, useState } from "react"
import { NavBar, List, Button, Toast, SpinLoading, Picker } from 'antd-mobile'
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from '../supabase'

export default function PembayaranList() {
  const navigate = useNavigate();
  let { state } = useLocation();

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
    const { data, error } = await supabase.from("v2_peserta")
                              .select('id, nama')
                              .eq('kelas_id', kelas_id)
                              .order('nama')
    setDataList(data)

    Toast.clear()
  }

  const onPickerChange = (value) => {
    setPickerValue(value[0])
    pickerList[0].map(row => {
      if(row.value === value[0])
        setPickerLabel(row.label)
    })

    getDataList(value[0])
  }

  return (
    <>
      <NavBar backArrow={false}>
        Pembayaran
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
      <List>
      {dataList && dataList.map((row, idx) =>
        <List.Item 
          key={idx}
          onClick={() => navigate('/pembayaran_detail', { state:{kelas_id:pickerValue, kelas_nama:pickerLabel, peserta_id:row.id, peserta_nama:row.nama} } )}
        >
          {row.nama}
        </List.Item>
        )}
      </List>
    </>
  );
}
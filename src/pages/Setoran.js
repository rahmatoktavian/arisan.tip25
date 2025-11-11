import { useEffect, useState } from "react"
import { NavBar, List, Form, SearchBar, Button, Toast, SpinLoading, Picker } from 'antd-mobile'
import { StopOutline, StarOutline, StarFill, CheckCircleOutline, QuestionCircleOutline } from 'antd-mobile-icons'
import { ethers } from "ethers"
;
import { supabase } from '../supabase'

function Setoran() {
  const [form] = Form.useForm()
  const [popupVisible, setPopupVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dataList, setDataList] = useState([])
  const [dataSearch, setDataSearch] = useState('')

  const [pickerView, setPickerView] = useState(false)
  const [pickerList, setPickerList] = useState()
  const [pickerValue, setPickerValue] = useState('')
  const [pickerLabel, setPickerLabel] = useState('')

  useEffect(() => {
    getDataPeriode()
  }, [dataSearch]);

  async function getDataPeriode() {
    const { data:periode } = await supabase.from("ar_periode")
                              .select('id, nama')
                              .order('tanggal_akhir', { ascending:false })
   
    let pickerListVal = [];
    periode.map((row, idx) => {
      pickerListVal.push({
        value:row.id, 
        label:row.nama
      })
    })
    setPickerList([pickerListVal])

    setPickerLabel(periode[0].nama)
    setPickerValue(periode[0].id)
    getDataList(periode[0].id)
  }

  async function getDataList(periodeID) {
    Toast.show({ content: (<SpinLoading />) })
    const { data } = await supabase.from("ar_setoran_peserta")
                              .select('id, periode_id, peserta_id, is_bayar, is_pemenang, ar_peserta!inner(nama,telepon), ar_periode!inner(nama)')
                              .eq('periode_id', periodeID)
                              .ilike('ar_peserta.nama', '%'+dataSearch+'%')
                              .order('ar_peserta(nama)', { ascending:true })

    setDataList(data);
    Toast.clear()
  }

  async function onUpdate(tipe, row) {
    const isConfirmed = window.confirm("Are you sure you want to update?");
    if (isConfirmed) {
    Toast.show({ content: (<SpinLoading />) })

    if(tipe == 'paid') {
        await supabase.from("ar_setoran_peserta")
            .update({
                is_bayar: true,
              })
            .eq('id', row.id)
        
        //blockchain
        // const today = new Date();
        // const day = String(today.getDate()).padStart(2, '0');
        // const month = String(today.getMonth() + 1).padStart(2, '0');
        // const year = today.getFullYear();
        // const formattedDate = `${year}${month}${day}`;
        
        // const dataBlockchain = {
        //       periode_id: row.periode_id,
        //       periode_nama: row.ar_periode.nama,
        //       peserta_id: row.peserta_id,
        //       peserta_nama: row.ar_peserta.nama,
        //       amountScaled: 100000,
        //       tanggal_ymd: Number(formattedDate),
        // }

        // const response = await fetch("http://localhost:4000/setoran", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify(dataBlockchain),
        // });
        
      } else if(tipe == 'unpaid') {
        await supabase.from("ar_setoran_peserta")
            .update({
                is_bayar: false,
              })
            .eq('id', row.id)

      } else {
        await supabase.from("ar_setoran_peserta")
                .update({
                    is_pemenang: false,
                  })
                .eq('is_pemenang', true)

        await supabase.from("ar_setoran_peserta")
            .update({
                is_pemenang: true,
              })
            .eq('id', row.id)
      }

      await getDataList(row.periode_id)
      setIsLoading(false)

      Toast.show({
        icon: 'success',
        content: 'Berhasil simpan data',
      })
      Toast.clear()
    }
  }

  const onPickerChange = (value) => {
    pickerList[0].map(row => {
      if(row.value === value[0]) {
        setPickerLabel(row.label)
      }
    })

    setPickerValue(value[0])
    getDataList(value[0])
  }

  async function onSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <>
      <NavBar backArrow={false} right={<StopOutline fontSize={23} onClick={() => onSignOut()} />}>
        <span style={{fontSize:23}}>Setoran</span>
      </NavBar>
    
      <Button block size='small' fill='outline' color='primary' onClick={() => setPickerView(true)}>Periode: {pickerLabel}</Button>
      <Picker
        columns={pickerList}
        visible={pickerView}
        onClose={() => setPickerView(false)}
        value={[pickerValue]}
        onConfirm={value => onPickerChange(value)}
        confirmText='Pilih'
        cancelText='Batal'
      />
      
      <SearchBar placeholder='Cari Nama Peserta' style={{ marginTop:10, marginBottom:10 }} onChange={(text) => setDataSearch(text)} />

      <div style={{height:575,overflow:'auto'}}>
        <List>
        {dataList && dataList.map((row, idx) =>
          <List.Item 
            key={idx}
            prefix={row.is_bayar ? <CheckCircleOutline fontSize={25} color='var(--adm-color-primary)' /> : <QuestionCircleOutline fontSize={25} />} 
            extra={row.is_bayar && (row.is_pemenang ? <StarFill fontSize={25} color='var(--adm-color-primary)' /> : <StarOutline fontSize={25} onClick={() => onUpdate('pemenang', row)} />)} 
            onClick={() => row.is_bayar ? onUpdate('unpaid', row) : onUpdate('paid', row)}
          >
            {row.ar_peserta.nama}
          </List.Item>
          )}
        </List>
      </div>
    </>
  );
}

export default Setoran;
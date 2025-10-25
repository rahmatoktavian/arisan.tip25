import { useEffect, useState } from "react"
import { NavBar, List, Popup, Form, Input, Radio, Button, Toast, SpinLoading, Picker } from 'antd-mobile'
import { StopOutline, StarOutline, CheckCircleOutline, QuestionCircleOutline } from 'antd-mobile-icons'
import { supabase } from '../supabase'

function Setoran() {
  const [form] = Form.useForm()
  const [popupVisible, setPopupVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dataList, setDataList] = useState([])

  // const [periodID, setPeriodeID] = useState('')
  const [pickerView, setPickerView] = useState(false)
  const [pickerList, setPickerList] = useState()
  const [pickerValue, setPickerValue] = useState('')
  const [pickerLabel, setPickerLabel] = useState('')

  useEffect(() => {
    getDataPeriode()
  }, []);

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
                              .select('id, periode_id, is_pemenang, nominal, tanggal, ar_peserta!inner(nama,telepon)')
                              .eq('periode_id', periodeID)
                              .order('ar_peserta(nama)', { ascending:true })

    setDataList(data);
    Toast.clear()
  }

  function onUpdate(row) {
    if(row.tanggal != null) {
      form.setFieldsValue({ 
        id: row.id,
        periode_id: row.periode_id,
        nominal: row.nominal,
        tanggal: row.tanggal,
        is_pemenang: false,
      });
    } else {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const formattedDate = `${year}-${month}-${day}`;
      
      form.setFieldsValue({ 
        id: row.id,
        periode_id: row.periode_id,
        nominal: '',
        tanggal: formattedDate,
        is_pemenang: false,
      });
    }

    setPopupVisible(true)
  }

  async function onSubmit(input) {
    setIsLoading(true)
    
    //insert
    if(input.id === 0) {
      await supabase.from("ar_setoran_peserta")
              .insert({
                nominal: input.nominal,
                tanggal: input.tanggal,
              })

    //update
    } else {
      await supabase.from("ar_setoran_peserta")
              .update({
                nominal: input.nominal,
                tanggal: input.tanggal,
                is_pemenang: input.is_pemenang,
              })
              .eq('id', input.id)
    }

    await getDataList(input.periode_id)
    setPopupVisible(false)
    setIsLoading(false)

    Toast.show({
      icon: 'success',
      content: 'Berhasil simpan data',
    })
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
      
      <div style={{height:600,overflow:'auto'}}>
        <List>
        {dataList && dataList.map((row, idx) =>
          <List.Item 
            key={idx}
            description={row.nominal ? row.nominal.toLocaleString() : ''}
            prefix={row.nominal ? <CheckCircleOutline fontSize={25} color='var(--adm-color-primary)' /> : <QuestionCircleOutline fontSize={25} />} 
            extra={row.is_pemenang && <StarOutline fontSize={25} color='var(--adm-color-primary)' />} 
            onClick={() => onUpdate(row)}
          >
            {row.ar_peserta.nama}
          </List.Item>
          )}
        </List>
      </div>

      <Popup
        visible={popupVisible}
        onMaskClick={() => {setPopupVisible(false)}}
        onClose={() => {setPopupVisible(false)}}
      >
        <Form 
          layout='horizontal'
          onFinish={onSubmit}
          form={form}
          footer={
            <>
              <Button shape='rounded' loading={isLoading} color='primary' fill='solid' block type='submit'>
                Simpan
              </Button>
              <Button shape='rounded' loading={isLoading} color='primary' fill='outline' block onClick={() => setPopupVisible(false)} style={{marginTop:10}}>
                Batal
              </Button>
            </>
          }
        >
          <Form.Header>Data Peserta</Form.Header>
          <Form.Item name='id' hidden rules={[{ required:true, message:'Wajib diisi' }]}>
            <Input placeholder='id' />
          </Form.Item>
          <Form.Item name='periode_id' hidden rules={[{ required:true, message:'Wajib diisi' }]}>
            <Input placeholder='periode_id' />
          </Form.Item>
          <Form.Item label="Nominal" name='nominal' rules={[{ required:true, message:'Wajib diisi' }]}>
            <Input placeholder='Nominal' type='number' />
          </Form.Item>
          <Form.Item label="Tanggal" name='tanggal' rules={[{ required:true, message:'Wajib diisi' }]}>
            <Input placeholder='Tanggal Bayar' type='date' />
          </Form.Item>
          <Form.Item label="Pemenang" name='is_pemenang' rules={[{ required:true, message:'Wajib diisi' }]}>
            <Radio.Group>
              <Radio value={true}> Ya</Radio>
              <Radio value={false} style={{marginLeft:10}}> Tidak</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Popup>
    </>
  );
}

export default Setoran;
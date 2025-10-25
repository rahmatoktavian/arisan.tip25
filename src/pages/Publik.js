import { useEffect, useState } from "react"
import { NavBar, List, Popup, Form, Input, Button, Toast, SpinLoading, Picker } from 'antd-mobile'
import { SetOutline, StarOutline, CheckCircleOutline, QuestionCircleOutline, EyeOutline } from 'antd-mobile-icons'
import { supabase } from '../supabase'

function Publik() {
  const [popupVisible, setPopupVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dataList, setDataList] = useState([])
  const [showPassword, setShowPassword] = useState(false)

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
        value:row.id, label:row.nama
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
                              .select('id, nominal, tanggal, is_pemenang, ar_peserta!inner(nama,telepon)')
                              .eq('periode_id', periodeID)
                              .order('ar_peserta(nama)', { ascending:true })

    setDataList(data);
    Toast.clear()
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

  async function onLogin(input) {
    setIsLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email: input.email, 
      password: input.password
    })

    if (error) {
      Toast.show({
        content: error.message
      })
    }

    setIsLoading(false)
  }

  return (
    <>
      <NavBar backArrow={false} right={<SetOutline fontSize={23} onClick={() => setPopupVisible(true)} />}>
        <span style={{fontSize:23}}>Arisan TIP 2025</span>
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
            description={row.nominal ? row.tanggal : ''}
            prefix={row.nominal ? <CheckCircleOutline fontSize={25} color='var(--adm-color-primary)' /> : <QuestionCircleOutline fontSize={25} />} 
            extra={row.is_pemenang && <StarOutline fontSize={25} color='var(--adm-color-primary)' />} 
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
          onFinish={onLogin}
          footer={
            <Button shape='rounded' loading={isLoading} color='primary' fill='solid' block type='submit'>
              Login
            </Button>
          }
        >
          <Form.Header>Login</Form.Header>
          <Form.Item name='email' rules={[{ required:true, type:'email', message:'Wajib diisi' }]}>
            <Input placeholder='Email' />
          </Form.Item>
          <Form.Item name='password' rules={[{ required:true, min:6, message:'Wajib diisi' }]} extra={<EyeOutline onClick={() => setShowPassword(!showPassword)} />}>
            <Input placeholder='Password' type={showPassword ? 'text ' : 'password'} />
          </Form.Item>
        </Form>
      </Popup>
    </>
  );
}

export default Publik;
import { useEffect, useState } from "react"
import { NavBar, List, Popup, Form, Input, Button, Toast, SpinLoading, Grid } from 'antd-mobile'
import { AddCircleOutline } from 'antd-mobile-icons'
import { supabase } from '../supabase'

function Peserta() {
  const [form] = Form.useForm()
  const [popupVisible, setPopupVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dataList, setDataList] = useState([])
  const [dataID, setDataID] = useState(0)

  useEffect(() => {
    getDataList();
  }, []);

  async function getDataList() {
    Toast.show({ content: (<SpinLoading />) })

    const { data } = await supabase.from("ar_peserta")
                              .select('id, nama, telepon')
                              .order('nama', { ascending:true })
    setDataList(data);
    Toast.clear()
  }

  function onInsert() {
    form.setFieldsValue({ 
      id: 0,
      nama: '',
      telepon: '',
    });

    setPopupVisible(true)
    setDataID(0)
  }

  function onUpdate(row) {
    form.setFieldsValue({ 
      id: row.id,
      nama: row.nama,
      telepon: row.telepon,
    });

    setPopupVisible(true)
    setDataID(row.id)
  }

  async function onSubmit(input) {
    setIsLoading(true)

    //insert
    if(input.id === 0) {
      await supabase.from("ar_peserta")
              .insert({
                nama: input.nama,
                telepon: input.telepon,
              })

    //update
    } else {
      await supabase.from("ar_peserta")
              .update({
                nama: input.nama,
                telepon: input.telepon,
              })
              .eq('id', input.id)
    }

    await getDataList()
    setPopupVisible(false)
    setIsLoading(false)

    Toast.show({
      icon: 'success',
      content: 'Berhasil simpan data',
    })
  }

  async function onDelete() {
    const isConfirmed = window.confirm("Are you sure you want to delete?");
    if (isConfirmed) {
      setIsLoading(true)

      await supabase.from("ar_peserta")
              .delete()
              .eq('id', dataID)

      await getDataList()
      setPopupVisible(false)
      setIsLoading(false)

      Toast.show({
        icon: 'success',
        content: 'Berhasil hapus data',
      })
    }
  }

  return (
    <>
      <NavBar backArrow={false} right={<AddCircleOutline fontSize={28} onClick={() => onInsert()} />}>
        <span style={{fontSize:23}}>Peserta</span>
      </NavBar>
      <div style={{height:600,overflow:'auto'}}>
        <List>
        {dataList && dataList.map((row, idx) =>
          <List.Item 
            key={idx}
            description={row.telepon}
            onClick={() => onUpdate(row)}
          >
            {row.nama}
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
              <Grid columns={3} gap={2}>
                <Grid.Item span={dataID === 0 ? 3 : 2}>
                  <Button shape='rounded' loading={isLoading} color='primary' fill='outline' block onClick={() => setPopupVisible(false)} style={{marginTop:10}}>
                    Batal
                  </Button>
                </Grid.Item>
                {dataID !== 0 &&
                <Grid.Item>
                  <Button shape='rounded' loading={isLoading} color='danger' fill='outline' block onClick={() => onDelete()} style={{marginTop:10}}>
                    Hapus
                  </Button>
                </Grid.Item>
                }
              </Grid>
            </>
          }
        >
          <Form.Header>Data Periode</Form.Header>
          <Form.Item name='id' hidden rules={[{ required:true, message:'Wajib diisi' }]}>
            <Input placeholder='ID' />
          </Form.Item>
          <Form.Item label='Nama'  name='nama' rules={[{ required:true, message:'Wajib diisi' }]}>
            <Input placeholder='Nama' />
          </Form.Item>
          <Form.Item label='Telepon'  name='telepon' rules={[{ required:true, message:'Wajib diisi' }]}>
            <Input placeholder='Nomor HP' />
          </Form.Item>
        </Form>
      </Popup>
    </>
  );
}

export default Peserta;
import { useEffect, useState } from "react"
import { NavBar, List, Popup, Form, Input, Button, Toast, SpinLoading, Grid } from 'antd-mobile'
import { AddCircleOutline } from 'antd-mobile-icons'
import { supabase } from '../supabase'
import { v4 as uuidv4 } from 'uuid'

function Periode() {
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

    const { data } = await supabase.from("ar_periode")
                              .select('id, nama, tanggal_akhir')
                              .order('nama', { ascending:true })
    setDataList(data);

    Toast.clear()
  }

  function onUpdate(row) {
    if(row.tanggal_akhir != null) {
      form.setFieldsValue({ 
        id: row.id,
        nama: row.nama,
        tanggal_akhir: row.tanggal_akhir,
      });
    } else {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const formattedDate = `${year}-${month}-${day}`;
      
      form.setFieldsValue({ 
        id: 0,
        nama: '',
        tanggal_akhir: formattedDate,
      });
    }

    setPopupVisible(true)
    setDataID(row.id)
  }

  async function onSubmit(input) {
    setIsLoading(true)

    //insert
    if(input.id === 0) {
      console.log('insert')
      const periode_id = uuidv4();
      await supabase.from("ar_periode")
              .insert({
                id: periode_id,
                nama: input.nama,
                tanggal_akhir: input.tanggal_akhir,
              })
    
      //insert peserta
      const { data:dataPeserta } = await supabase.from("ar_peserta")
                              .select('id')

      dataPeserta.map(async(item) => {
          await supabase.from("ar_setoran_peserta")
              .insert({
                periode_id: periode_id,
                peserta_id: item.id,
                is_bayar: false,
                is_pemenang: false,
              })
      })

    //update
    } else {
      console.log('update')
      await supabase.from("ar_periode")
              .update({
                nama: input.nama,
                tanggal_akhir: input.tanggal_akhir,
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

      await supabase.from("ar_periode")
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

  function onClose() {
    setPopupVisible(false)
    form.setFieldsValue({ 
        id: 0,
        nama: '',
        tanggal_akhir: '',
      });
  }

  return (
    <>
      <NavBar backArrow={false} right={<AddCircleOutline fontSize={28} onClick={() => onUpdate({})} />}>
        <span style={{fontSize:23}}>Periode</span>
      </NavBar>
      <div style={{height:580,overflow:'auto'}}>
        <List>
        {dataList && dataList.map((row, idx) =>
          <List.Item 
            key={idx}
            description={'Tanggal Akhir: '+row.tanggal_akhir}
            onClick={() => onUpdate(row)}
          >
            {row.nama}
          </List.Item>
          )}
        </List>
      </div>

      <Popup
        visible={popupVisible}
        onMaskClick={() => onClose()}
        onClose={() => onClose()}
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
          <Form.Header>Data Peserta</Form.Header>
          <Form.Item name='id' hidden>
            <Input placeholder='ID' />
          </Form.Item>
          <Form.Item label='Nama' name='nama' rules={[{ required:true, message:'Wajib diisi' }]}>
            <Input placeholder='Nama' />
          </Form.Item>
          <Form.Item label='Tanggal Akhir' name='tanggal_akhir' rules={[{ required:true, message:'Wajib diisi' }]}>
            <Input placeholder='Tanggal Akhir' type='date' />
          </Form.Item>
        </Form>
      </Popup>
    </>
  );
}

export default Periode;
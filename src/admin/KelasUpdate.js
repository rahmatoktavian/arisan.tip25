import React, { useEffect } from "react"
import { NavBar, Form, Input, Button, Toast, SpinLoading } from 'antd-mobile'
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from '../supabase'

export default function KelasUpdate() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form] = Form.useForm()

  useEffect(() => {
    getData();
  }, []);

  async function getData  () {
    Toast.show({ content: (<SpinLoading />) })

    //pertemuan
    const { data } = await supabase.from("v2_kelas")
                              .select('nama, topik, pertemuan, biaya')
                              .eq('id', state.kelas_id)
                              .single();

    form.setFieldsValue({ 
      nama: data.nama,
      topik: data.topik,
      pertemuan: data.pertemuan,
      biaya: data.biaya,
    });

    Toast.clear()
  }

  async function onSave(input) {
    Toast.show({ content: (<SpinLoading />) })
    
    //insert pertemuan
    await supabase.from("v2_kelas").update({
      nama: input.nama,
      topik: input.topik,
      pertemuan: input.pertemuan,
      biaya: input.biaya,
    })
    .eq('id', state.kelas_id)

    Toast.clear()
    navigate('/kelas_list')
  }

  return (
    <>
      <NavBar onBack={() => navigate('/kelas_list')}>
        Ubah Kelas
      </NavBar>

      <Form 
        layout='horizontal'
        onFinish={onSave}
        footer={
          <Button block color='primary' type='submit'>Simpan</Button>
        }
        form={form}
      >
        <Form.Item name='nama' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Nama' />
        </Form.Item>
        <Form.Item name='topik' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Topik' />
        </Form.Item>
        <Form.Item name='pertemuan' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Pertemuan' />
        </Form.Item>
        <Form.Item name='biaya' rules={[{ required:true, message:'Wajib diisi' }]}>
          <Input placeholder='Biaya' />
        </Form.Item>
      </Form>
    </>
  );
}
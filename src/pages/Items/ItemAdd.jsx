import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav'
import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { FaRegCheckCircle } from "react-icons/fa";
import { LuRefreshCcw } from "react-icons/lu";
import { CgPlayListAdd } from "react-icons/cg";
import useMyToaster from '../../hooks/useMyToaster';
import { SelectPicker } from 'rsuite';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import MySelect2 from '../../components/MySelect2';
import { Icons } from '../../helper/icons';



const ItemAdd = ({ mode }) => {
  return (
    <>
      <Nav title={mode ? "Update Item " : "Add Item"} />
      <main id='main'>
        <SideNav />
        <div className='content__body'>
          <AddItemComponent mode={mode} />
        </div>
      </main>
    </>
  )
}

const AddItemComponent = ({ mode, save }) => {
  const toast = useMyToaster();
  const { getApiData } = useApi()
  const editorRef = useRef(null);
  const [form, setForm] = useState({
    title: '', type: '', salePrice: '', category: '', details: '', hsn: '', tax: ''
  })
  const { id } = useParams();
  const [category, setCategory] = useState([])
  const [tax, setTax] = useState([]);
  const [unit, setUnit] = useState([]);
  const [fullCategory, setFullCategory] = useState([]);
  const unitRowSet = {
    unit: "", conversion: '', opening: '', alert: ''
  }
  const [unitRow, setUnitRow] = useState([unitRowSet]);
  const navigate = useNavigate();



  useEffect(() => {
    if (mode) {
      const get = async () => {
        const url = process.env.REACT_APP_API_URL + "/item/get";
        const cookie = Cookies.get("token");

        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify({ token: cookie, id: id })
        })
        const res = await req.json();
        const data = res.data;
        setForm({
          title: data.title, type: data.type, salePrice: data.salePrice,
          category: data.category?._id, details: data.details, hsn: data.category?.hsn, tax: data.category?.tax
        });
        setUnitRow([...data.unit]);
      }

      get();
    }
  }, [mode])

  // Get Data
  useEffect(() => {
    const get = async () => {
      // Category
      {
        const { data } = await getApiData("category");
        setCategory([...data.map(({ _id, title }, _) => ({ value: _id, label: title }))]);
        setFullCategory([...data]);
      }
      // Tax
      {
        const { data } = await getApiData("tax");
        setTax([...data.map(({ _id, title }, _) => ({ label: title, value: _id }))])
      }
      // Unit
      {
        const { data } = await getApiData("unit");
        setUnit([...data.map(({ _id, title }, _) => ({ label: title, value: _id }))])
      }
    }
    get()

  }, [])


  const savebutton = async (e) => {
    if (form.title === "") {
      return toast("Item name can't be blank", "error")
    }
    else if (form.salePrice === "") {
      return toast("Price can't be blank", "error")
    }
    else if (form.category === "") {
      return toast("Category can't be blank", "error")
    }

    try {
      const url = process.env.REACT_APP_API_URL + "/item/add";
      const token = Cookies.get("token");
      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          !mode ? { ...form, token, unit: unitRow }
            : { ...form, token, unit: unitRow, update: true, id: id }
        )
      })
      const res = await req.json();
      if (req.status !== 200 || res.err) {
        return toast(res.err, 'error');
      }

      if (!mode) clearData();

      toast(!mode ? "Item create success" : "Item update success", 'success');
      // for close sidebar in MySelect2
      if(save){
        save(true)
        return
      }else{
        return navigate("/admin/item")
      }

    } catch (error) {
      console.log(error);
      return toast("Something went wrong", "error")
    }

  }

  const clearData = () => {
    setForm({
      title: '', type: '', salePrice: '', category: '', details: '', hsn: ''
    })
    setUnitRow([unitRowSet]);
  }

  const categoryChange = (v) => {
    fullCategory.forEach((c, _) => {
      if (c._id === v) {
        setForm({ ...form, hsn: c.hsn, category: v, tax: c.tax._id })
      }
    })
  }

  return (
    <div className='content__body__main bg-white'>
      <div className='  flex justify-between  gap-5 flex-col lg:flex-row'>
        <div className='w-full'>
          <div >
            <p className='mb-2 '>Item Name <span className='required__text'>*</span></p>
            <input type='text' onChange={(e) => setForm({ ...form, title: e.target.value })} value={form.title} />
          </div>
          <div>
            <p className='mb-2 mt-2 ml-1'>Type</p>
            <select onChange={(e) => setForm({ ...form, type: e.target.value })} value={form.type}>
              <option value={""}>--select--</option>
              <option value={"goods"}>Goods</option>
              <option value={"service"}>Service</option>
            </select>
          </div>
          <div>
            <p className='mt-2 mb-2'>Price  <span className='required__text'>*</span></p>
            <input type="text" onChange={(e) => setForm({ ...form, salePrice: e.target.value })} value={form.salePrice} />
          </div>
        </div>
        <div className='w-full pt-1'>
          <div>
            <p className='ml-1'>Select Category <span className='required__text'>*</span></p>
            {/* <SelectPicker className='w-full'
              data={category}
              onChange={(v) => categoryChange(v)}
              value={form.category} /> */}
            <MySelect2
              model={"category"}
              onType={(v) => {
                console.log(v)
                setForm({ ...form, category: v })
              }}
              value={form.category}
            />
          </div>
          <div>
            <p className='ml-1 mb-2 mt-2'>Select Tax</p>
            <SelectPicker className='w-full'
              data={tax}
              onChange={(v) => setForm({ ...form, tax: v })}
              value={form.tax} />
          </div>
          <div>
            <p className=' mt-2 mb-2 ml-1'>HSN/SAC</p>
            <input type='text'
              onChange={(e) => setForm({ ...form, hsn: e.target.value })}
              value={form.hsn} />
          </div>
        </div>
      </div>

      <div className='w-full overflow-auto mt-2'>
        <table className='w-full border'>
          <thead className='bg-gray-200'>
            <tr>
              <th className='p-1'>Unit</th>
              <th>Conversion (1 for 1st Unit)</th>
              <th>Opening</th>
              <th>Alert</th>
              <th align='center'>Action</th>
            </tr>
          </thead>
          <tbody>
            {unitRow.map((u, i) => (
              <tr key={i}>
                <td className='p-1'>
                  <select onChange={(e) => {
                    const newUnitRow = [...unitRow];
                    newUnitRow[i].unit = e.target.value;
                    setUnitRow(newUnitRow);
                  }} value={u.unit}>
                    <option value={""}>--select--</option>
                    {unit.map((u, i) => (
                      <option key={i} value={u.label}>{u.label}</option>
                    ))}
                  </select>
                </td>
                <td className='p-1'>
                  <input type="text" onChange={(e) => {
                    const newUnitRow = [...unitRow];
                    newUnitRow[i].conversion = e.target.value;
                    setUnitRow(newUnitRow);
                  }} value={u.conversion} />
                </td>
                <td className='p-1'>
                  <input type="text" onChange={(e) => {
                    const newUnitRow = [...unitRow];
                    newUnitRow[i].opening = e.target.value;
                    setUnitRow(newUnitRow);
                  }} value={u.opening} />
                </td>
                <td className='p-1'>
                  <input type="text" onChange={(e) => {
                    const newUnitRow = [...unitRow];
                    newUnitRow[i].alert = e.target.value;
                    setUnitRow(newUnitRow);
                  }} value={u.alert} />
                </td>
                <td align='center' className='p-1'>
                  <div className='delete__icon'>
                    <Icons.DELETE
                      className='cursor-pointer text-[16px]'
                      onClick={() => {
                        if (unitRow.length === 1) return;
                        const newUnitRow = [...unitRow];
                        newUnitRow.splice(i, 1);
                        setUnitRow(newUnitRow);
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5}>
                <button
                  className='w-full p-[5px] font-bold bg-gray-200 text-gray-800 flex justify-center items-center active:bg-gray-300'
                  onClick={() => setUnitRow([...unitRow, unitRowSet])}>
                  <Icons.ADD_LIST />  Add
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className='flex justify-center mt-3'>
        <div className='flex rounded-sm bg-green-500 text-white'>
          <Icons.CHECK className='mt-3 ml-2' />
          <button className='p-2' onClick={savebutton}>{mode ? "Update" : "Save"}</button>
        </div>
        <div className='flex rounded-sm ml-4 bg-blue-500 text-white'>
          <Icons.RESET className='mt-3 ml-2' />
          <button className='p-2' onClick={clearData}>Reset</button>
        </div>
      </div>
    </div>
  )
}


export {
  AddItemComponent
}
export default ItemAdd;
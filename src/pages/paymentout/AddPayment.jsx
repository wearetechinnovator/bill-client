import React, { useEffect, useRef, useState } from 'react'
import Nav from '../../components/Nav'
import SideNav from '../../components/SideNav'
import {  SelectPicker } from 'rsuite'
import { FaRegCheckCircle } from 'react-icons/fa'
import { BiReset } from 'react-icons/bi'
import useApi from '../../hooks/useApi'
import useMyToaster from '../../hooks/useMyToaster'
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom'
import MySelect2 from '../../components/MySelect2';





// --- PAYMENT OUT ---
const AddPayment = ({ mode }) => {
  const { getApiData } = useApi();
  const editorRef = useRef(null);
  const toast = useMyToaster();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    party: "", paymentOutNumber: "", paymentOutDate: "", paymentMode: "", account: "",
    amount: "", details: "", invoiceId: ''
  })

  const [dueAmount, setDueAmount] = useState(null);

  // Store party
  const [party, setParty] = useState([]);
  // Store account
  const [account, setAccount] = useState([]);
  // Store invoice number
  const [invoice, setInvoice] = useState([]);
  const navigate = useNavigate();

  // Get invoice
  useEffect(() => {
    const getInvoice = async () => {
      try {
        const url = process.env.REACT_APP_API_URL + "/purchaseinvoice/get";
        const cookie = Cookies.get("token");

        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify({ token: cookie, invoice: true, party: formData.party })
        })
        const res = await req.json();
        const inv = res.data.map((inv) => ({
          value: inv.purchaseInvoiceNumber, label: inv.purchaseInvoiceNumber,
          due: inv.dueAmount
        }));
        setInvoice([...inv])

      } catch (error) {
        console.log(error);
        return toast("Something went wrong", "error");
      }
    }

    getInvoice();

  }, [formData.party])



  // Get data for update mode
  useEffect(() => {
    if (mode) {
      const get = async () => {
        const url = process.env.REACT_APP_API_URL + "/paymentout/get";
        const cookie = Cookies.get("token");

        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify({ token: cookie, id: id })
        })
        const res = await req.json();
        console.log(res);
        setFormData({ ...formData, ...res.data });

      }

      get();
    }
  }, [mode])


  useEffect(() => {
    const apiData = async () => {
      {
        const data = await getApiData("party");
        const party = data.data.map(d => ({ label: d.name, value: d._id }));
        setParty([...party]);
      }
      {
        const data = await getApiData("account");
        const account = data.data.map(d => ({ label: d.title, value: d._id }));
        setAccount([...account])
      }
    }

    apiData();
  }, [])


  const savePayment = async () => {
    if ([formData.party, formData.paymentOutNumber,
    formData.paymentOutDate, formData.paymentMode, formData.account, formData.amount]
      .some((field) => field === "")) {
      return toast("Fill the blank", "error");
    }

    if (parseFloat(formData.amount) > parseFloat(dueAmount)) {
      return toast("Invalid amount", 'error');
    }

    try {
      const url = process.env.REACT_APP_API_URL + "/paymentout/add";
      const token = Cookies.get("token");

      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(!mode ? { ...formData, token } : { ...formData, token, update: true, id: id })
      })
      const res = await req.json();
      if (req.status !== 200 || res.err) {
        return toast(res.err, 'error');
      }

      if (mode) {
        return toast('Payment update successfully', 'success');
      }

      clear();
      toast('Payment add successfully', 'success');
      navigate("/admin/payment-out");
      return


    } catch (error) {
      console.log(error);
      return toast('Something went wrong', 'error')
    }

  }

  const clear = () => {
    setFormData({
      party: "", paymentOutNumber: "", paymentOutDate: "", paymentMode: "", account: "",
      amount: "", details: ""
    })
  }


  return (
    <>
      <Nav title={"Add Payment"} />
      <main id='main'>
        <SideNav />
        <div className='content__body'>
          <div className='content__body__main bg-white'>
            <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-0'>
              {/* First Column */}
              <div className='flex flex-col gap-2'>
                <div>
                  <p className='mb-1'>Select Party</p>
                  {/* <SelectPicker className='w-full'
                    onChange={(data) => setFormData({ ...formData, party: data })}
                    data={party}
                    value={formData.party}
                  /> */}
                  <MySelect2
                    model={"party"}
                    onType={(v) => {
                      setFormData({ ...formData, party: v })
                    }}
                    value={formData.party}
                  />
                </div>
                <div>
                  <p className='mb-1'>Payment in Number</p>
                  <input type='text'
                    value={formData.paymentOutNumber}
                    onChange={(e) => setFormData({
                      ...formData, paymentOutNumber: e.target.value
                    })}
                  />
                </div>
                <div>
                  <p className='mb-1'>Payment in Date</p>
                  <input type="date"
                    value={formData.paymentOutDate}
                    onChange={(e) => {
                      setFormData({ ...formData, paymentOutDate: e.target.value })
                    }}
                    className='w-full'
                  />
                </div>
                <div>
                  <p className='mb-1'>Due Amount</p>
                  <input type='text'
                    value={dueAmount}
                    onChange={null}
                    disabled
                  />
                </div>
              </div>

              {/* Second Column */}
              <div className='flex flex-col gap-2'>
                <div>
                  <p className='mb-1'>Payment Mode</p>
                  <select name="mode" id=""
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}>
                    <option value="">--Select--</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <p className='mb-1'>Account</p>
                  <SelectPicker className='w-full'
                    data={account}
                    onChange={(v) => setFormData({ ...formData, account: v })}
                    value={formData.account}
                  />
                </div>
                <div>
                  <p className='mb-1'>Select Invoice</p>
                  <SelectPicker className='w-full'
                    onChange={(data) => {
                      const getDue = invoice.filter((inv, _) => inv.value === data)
                      setDueAmount(getDue[0]?.due)
                      setFormData({ ...formData, invoiceId: data })
                    }}
                    data={invoice}
                  />
                </div>
                <div>
                  <p className='mb-1'>Amount</p>
                  <input type='text'
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className='w-full flex justify-center gap-3 mt-3'>
              <button
                onClick={savePayment}
                className='bg-green-500 hover:bg-green-400 text-md text-white rounded w-[70px] flex items-center justify-center gap-1 py-2'>
                <FaRegCheckCircle />
                {!mode ? "Save" : "Update"}
              </button>
              <button
                onClick={clear}
                className='bg-blue-800 hover:bg-blue-700 text-md text-white rounded w-[60px] flex items-center justify-center gap-1 py-2'>
                <BiReset />
                Reset
              </button>
            </div>
          </div>
        </div>

      </main>

    </>
  )
}

export default AddPayment;
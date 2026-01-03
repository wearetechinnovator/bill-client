import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav'
import { FaRegCheckCircle } from "react-icons/fa";
import { LuRefreshCcw } from "react-icons/lu";
import useMyToaster from '../../hooks/useMyToaster';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Icons } from '../../helper/icons';


const AddStaffAttendance = ({ mode }) => {
    const toast = useMyToaster();
    const [form, setForm] = useState({ title: '', details: '' });
    const { id } = useParams();
    const navigate = useNavigate();


    useEffect(() => {
        if (mode) {
            const get = async () => {
                const url = process.env.REACT_APP_API_URL + "/unit/get";
                const cookie = Cookies.get("token");

                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token: cookie, id: id })
                })
                const res = await req.json();
                setForm({ ...form, ...res.data });
            }

            get();
        }
    }, [mode])

    const saveData = async (e) => {
        if (form.title === "") {
            return toast("fill the blank", "error")
        }

        try {
            const url = process.env.REACT_APP_API_URL + "/unit/add";
            const token = Cookies.get("token");
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(!mode ? { ...form, token } : { ...form, token, update: true, id: id })
            })
            const res = await req.json();
            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            if (!mode) {
                setForm({ title: "", details: '' });
            }

            toast(!mode ? "Unit create success" : "Unit update success", 'success');
            navigate('/admin/unit');
            return


        } catch (error) {
            return toast("Something went wrong", "error")
        }

    }


    const resetData = (e) => {
        setForm({
            title: '',
        })
    }

    return (
        <>
            <Nav title={mode ? "Update Staff" : "Add Staff"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='content__body__main bg-white '>
                        <div className='w-full flex flex-col'>
                            <div className='w-full flex flex-col lg:flex-row'>
                                <div className='w-full'>
                                    <div className='p-2'>
                                        <p className='pb-1'>Staff Name <span className='required__text'>*</span></p>
                                        <input type='text'
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            value={form.title}
                                        />
                                    </div>
                                </div>
                                <div className='w-full'>
                                    <div className='p-2'>
                                        <p className='pb-1'>Mobile Number <span className='required__text'>*</span></p>
                                        <input type='text'
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            value={form.title}
                                        />
                                    </div>
                                </div>
                                <div className='w-full'>
                                    <div className='p-2'>
                                        <p className='pb-1'>DOB <span className='required__text'>*</span></p>
                                        <input type='date'
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            value={form.title}
                                        />
                                    </div>
                                </div>
                                <div className='w-full'>
                                    <div className='p-2'>
                                        <p className='pb-1'>Joining Date <span className='required__text'>*</span></p>
                                        <input type='date'
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            value={form.title}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Second Collumn start */}
                            <div className='w-full flex flex-col lg:flex-row mt-2'>
                                <div className='w-full'>
                                    <div className='p-2'>
                                        <p className='pb-1'>
                                            Salary Payout Type
                                            <span className='required__text'>*</span>
                                        </p>
                                        <select>
                                            <option value="monthly">Monthly</option>
                                            <option value="">Test</option>
                                            <option value="">Test</option>
                                        </select>
                                    </div>
                                </div>
                                <div className='w-full'>
                                    <div className='p-2'>
                                        <p className='pb-1'>
                                            Salary
                                            <span className='required__text'>*</span>
                                        </p>
                                        <input type='text'
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            value={form.title}
                                        />
                                    </div>
                                </div>
                                <div className='w-full'>
                                    <div className='p-2'>
                                        <p className='pb-1'>
                                            Salary Cycle
                                            <span className='required__text'>*</span>
                                        </p>
                                        <select>
                                            <option value="1-1-month">1 to 1 Every month</option>
                                            <option value="">Test</option>
                                            <option value="">Test</option>
                                        </select>
                                    </div>
                                </div>
                                <div className='w-full'>
                                    <div className='p-2'>
                                        <p className='pb-1'>
                                            Outstanding/Opening Balance
                                            <span className='required__text'>*</span>
                                        </p>
                                        <div className='flex border rounded p-[1px]'>
                                            <input
                                                type="text"
                                                className='rounded-none border-none border-r'
                                                placeholder='₹'
                                            />
                                            <select className='border-none bg-gray-100 rounded-none'>
                                                <option value="">To Pay</option>
                                                <option value="">To Collect</option>
                                                <option value="">Test</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-4 justify-center mt-5'>
                            <button onClick={saveData} className='flex items-center rounded-sm bg-green-500 text-white p-2 gap-1'>
                                <Icons.CHECK />
                                {mode ? "Update" : "Save"}
                            </button>
                            <button onClick={resetData} className='flex items-center rounded-sm bg-blue-500 text-white p-2 gap-1'>
                                <Icons.RESET />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default AddStaffAttendance;
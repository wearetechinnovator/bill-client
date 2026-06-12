import React from 'react'
import Nav from '../../components/Nav'
import SideNav from '../../components/SideNav'
import { useParams } from 'react-router-dom';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { useEffect } from 'react';
import { Drawer } from 'rsuite';
import { Icons } from '../../helper/icons';
import ActivityHistoryCard from '../../components/ActivityHistoryCard';
import Loading from '../../components/Loading';



const HistoryView = () => {
    const token = Cookies.get("token");
    const { id } = useParams();
    const toast = useMyToaster();
    const [loading, setLoading] = useState(false)
    const [darData, setDarData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [formData, setFormData] = useState({
        activityType: '', feedback: '', status: '', followUp: 'no', followDate: ''
    })




    // Get Dar and History Data;
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const URL = `${process.env.REACT_APP_API_URL}/dar/get-dar-with-history`;
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token, darId: id })
                });
                const res = await req.json();

                if (req.status !== 200 || res.err) {
                    toast(res.err, "error")
                } else {
                    setDarData(res.dar);
                    setHistoryData(res.history);
                }
            } catch (err) {
                return toast("Something went wrong", "error");
            } finally {
                setLoading(false);
            }
        })()
    }, [])

    const saveData = async (e) => {
        const validations = [
            { field: formData.activityType, msg: "Activity type can't be blank" },
            { field: formData.status, msg: "Status can't be blank" }
        ];

        for (const item of validations) {
            if (!item.field || item.field.trim() === "") {
                return toast(item.msg, "error");
            }
        }

        try {
            setLoading(true);
            const url = process.env.REACT_APP_API_URL + "/dar/add-history";
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...formData, token, darId: id })
            })

            const res = await req.json();
            if (req.status !== 201 || res.err) {
                return toast(res.err, 'error');
            }

            setHistoryData([...historyData, res.data]);
            toast(res.msg, 'success')

            clearData();
            setOpenDrawer(false);
        } catch (error) {
            console.log(error)
            toast("Something went wrong", "error")
        } finally {
            setLoading(false);
        }

    }

    const clearData = () => {
        setFormData({
            activityType: '', feedback: '', status: '', followUp: 'no', followDate: ''
        })
    }

    return (
        <>
            <Nav title={"DAR (Daily Activity Report) History"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='content__body__main'>
                        <div className='w-full flex items-center justify-between border-b pb-2'>
                            <p className='font-bold'>
                                <Icons.USER className='inline mr-1'/>
                                General Details
                            </p>
                            <button
                                onClick={() => setOpenDrawer(true)}
                                className='border px-3 py-1 rounded bg-[#003E32] hover:bg-[#034d3e]  text-white'>
                                + Add History
                            </button>
                        </div>
                        <div className='w-full grid gird-cols-1 sm:gird-cols-2 md:grid-cols-5 mt-3 pb-2'>
                            <div className='w-full'>
                                <p>NAME</p>
                                <p className='font-bold'>{darData?.name}</p>
                            </div>
                            <div className='w-full'>
                                <p>EMAIL</p>
                                <p>{darData?.email}</p>
                            </div>
                            <div className='w-full'>
                                <p>PHONE</p>
                                <p>{darData?.phone}</p>
                            </div>
                            <div className='w-full'>
                                <p>DESIGNATION</p>
                                <p>{darData?.designation || "--"}</p>
                            </div>
                            <div className='w-full'>
                                <p>COMPANY NAME</p>
                                <p>{darData?.companyName || "--"}</p>
                            </div>
                        </div>
                    </div>

                    {/* ==========================[Activity History]==================== */}
                    {/* ================================================================ */}

                    <div className="content__body__main">
                        {
                            historyData.length > 0 && (
                                <div className='mb-4 border-b pb-2'>
                                    <div className='flex items-center gap-2'>
                                        <Icons.HISTORY size={"25px"} />
                                        <p className='font-bold'>Activity History</p>
                                    </div>
                                </div>
                            )
                        }

                        {
                            historyData?.map((h, _) => {
                                return (
                                    <ActivityHistoryCard key={h._id} data={h} />
                                )
                            })
                        }
                    </div>

                </div>
            </main>

            <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)} size={'xs'}>
                <Drawer.Header>
                    <Drawer.Title></Drawer.Title>
                    <p className='text-[16px] font-bold'>Add History</p>
                </Drawer.Header>
                <Drawer.Body>
                    <div className='flex items-center gap-4 flex-col md:flex-row mt-4 px-4 py-2'>
                        <div className='w-full'>
                            <p>Actity Type</p>
                            <select
                                onChange={(e) => {
                                    setFormData({ ...formData, activityType: e.target.value })
                                }}
                                value={formData.activityType}
                            >
                                <option value="">Select</option>
                                <option value="call">Call</option>
                                <option value="message">Message</option>
                                <option value="email">Email</option>
                                <option value="whatsapp">Whatsapp</option>
                            </select>
                        </div>
                        <div className='w-full'>
                            <p>Status</p>
                            <select
                                onChange={(e) => {
                                    setFormData({ ...formData, status: e.target.value })
                                }}
                                value={formData.status}
                            >
                                <option value="">Select</option>
                                <option value="warm">Warm</option>
                                <option value="hot">Hot</option>
                                <option value="cold">Cold</option>
                                <option value="dead">Dead</option>
                            </select>
                        </div>

                        <div className='w-full'>
                            <p>Follow Up</p>
                            <select
                                onChange={(e) => {
                                    setFormData({ ...formData, followUp: e.target.value })
                                }}
                                value={formData.followUp}
                            >
                                <option value="">Select</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        {
                            formData.followUp === "yes" && (
                                <div className='w-full'>
                                    <p>Follow up date</p>
                                    <input type="date"
                                        onChange={(e) => {
                                            setFormData({ ...formData, followDate: e.target.value })
                                        }}
                                        value={formData.followDate}
                                    />
                                </div>
                            )
                        }
                    </div>

                    <div className='mt-2 px-4 pb-2'>
                        <p>Feedback</p>
                        <textarea rows={3}
                            onChange={(e) => {
                                setFormData({ ...formData, feedback: e.target.value })
                            }}
                            value={formData.feedback}
                        ></textarea>
                    </div>
                    <div className='w-full flex justify-center gap-3 mt-5'>
                        <button className='add-bill-btn' onClick={saveData}>
                            {!loading ? <Icons.CHECK /> : <Loading />} Save
                        </button>

                        <button className='reset-bill-btn'
                            onClick={clearData}>
                            <Icons.RESET />
                            Reset
                        </button>
                    </div>
                </Drawer.Body>
            </Drawer>
        </>
    )
}

export default HistoryView
import { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { checkNumber } from '../../helper/validation';
import { Toggle, SelectPicker } from 'rsuite';
import { Icons } from '../../helper/icons';
import { Constants } from '../../helper/constants';
import MySelect2 from '../../components/MySelect2';
import useApi from '../../hooks/useApi';
import AddContactDrawer from '../../components/AddContactDrawer';
import { useSelector } from 'react-redux';



const AddDar = ({ mode }) => {
    const token = Cookies.get("token");
    const userData = useSelector((store) => store.userDetail);
    const isAdmin = !userData?.role || userData?.role === "admin";
    const toast = useMyToaster();
    const navigate = useNavigate();
    const { getApiData } = useApi();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', companyName: '', designation: '', companyName: '',
        activityType: '', feedback: '', staus: '', followUp: '', followDate: ''
    })






    // Get data for update mode
    useEffect(() => {
        if (!mode) return;
        (async () => {
            try {
                const URL = process.env.REACT_APP_API_URL + "/enquiry/get";
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token, id: id })
                })
                const res = await req.json();
                setFormData({
                    ...formData, ...res.data,
                    deliveryDate: res.data.deliveryDate.split("T")[0],
                    party: res.data.party._id, contactPerson: res.data.contactPerson._id
                });
            } catch (er) {
                console.log(er);
                return toast("Data not fetch", 'error');
            }
        })()
    }, [mode])


    const saveData = async (e) => {
        const validations = [
            { field: formData.name, msg: "Name can't be blank" },
            { field: formData.email, msg: "Email can't be blank" }
        ];

        for (const item of validations) {
            if (!item.field || item.field.trim() === "") {
                return toast(item.msg, "error");
            }
        }

        try {
            const url = process.env.REACT_APP_API_URL + "/dar/add";
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...formData, token })
            })

            const res = await req.json();
            if (req.status !== 201 || res.err) {
                return toast(res.err, 'error');
            }

            toast(res.msg, 'success')
            navigate("/admin/dar");
            clearData()
            return;
        } catch (error) {
            toast("Something went wrong", "error")
        }

    }

    const updateData = async (e) => {
        const validations = [
            { field: formData.party, msg: "Select party" },
            { field: formData.enqNo, msg: "Contact personal is required" },
            { field: formData.contactPerson, msg: "Contact personal is required" },
            { field: formData.deliveryDate, msg: "Delivery date is required" },
        ];

        for (const item of validations) {
            if (!item.field) {
                return toast(item.msg, "error");
            }
        }

        if (formData.items.length === 0 || formData.items.some(i => !i.item || !i.qty)) {
            return toast("Please add item with quantity", "error");
        }


        try {
            const url = process.env.REACT_APP_API_URL + "/enquiry/update";
            const req = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...formData, token, id })
            })

            const res = await req.json();
            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            toast(res.msg, 'success')
            navigate("/admin/enquiry")
            clearData()
            return;
        } catch (error) {
            toast("Something went wrong", "error")
        }

    }

    const clearData = () => {
        setFormData({
            name: '', email: '', phone: '', companyName: '', designation: '',
            activityType: '', feedback: '', staus: '', followUp: '', followDate: ''
        })
    }

    return (
        <>
            <Nav title={mode ? "Update DAR (Daily Activity Report)" : "Add DAR (Daily Activity Report)"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='content__body__main bg-white '>
                        <div className='justify-between grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gr gap-4'>
                            <div className='w-full'>
                                <p>Name <span className='required__text'>*</span></p>
                                <input type="text"
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value })
                                    }}
                                    value={formData.name}
                                />
                            </div>
                            <div className='w-full'>
                                <p>Email <span className='required__text'>*</span></p>
                                <input type="email"
                                    onChange={(e) => {
                                        setFormData({ ...formData, email: e.target.value })
                                    }}
                                    value={formData.email}
                                />
                            </div>
                            <div className='w-full'>
                                <p>Phone</p>
                                <input type="text"
                                    onChange={(e) => {
                                        setFormData({ ...formData, phone: e.target.value })
                                    }}
                                    value={formData.phone}
                                />
                            </div>
                            <div className='w-full'>
                                <p>Designation</p>
                                <input type="text"
                                    onChange={(e) => {
                                        setFormData({ ...formData, designation: e.target.value })
                                    }}
                                    value={formData.designation}
                                />
                            </div>
                        </div>
                        <div className='flex items-center gap-4 flex-col md:flex-row mt-4'>
                            <div className='w-full'>
                                <p>Company Name</p>
                                <input type="text"
                                    onChange={(e) => {
                                        setFormData({ ...formData, companyName: e.target.value })
                                    }}
                                    value={formData.companyName}
                                />
                            </div>
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
                                        setFormData({ ...formData, staus: e.target.value })
                                    }}
                                    value={formData.staus}
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


                        <div className='mt-2'>
                            <p>Feedback</p>
                            <textarea rows={3}
                                onChange={(e) => {
                                    setFormData({ ...formData, feedback: e.target.value })
                                }}
                                value={formData.feedback}
                            ></textarea>
                        </div>


                        <div className='w-full flex justify-center gap-3 my-3 mt-5'>
                            <button className='add-bill-btn'
                                onClick={mode ? updateData : saveData}>
                                <Icons.CHECK />
                                {mode ? "Update" : "Save"}
                            </button>

                            <button className='reset-bill-btn'
                                onClick={clearData}>
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

export default AddDar;
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



const AddEnquiry = ({ mode }) => {
    return (
        <>
            <Nav title={mode ? "Update Enquiry Track" : "Add Enquiry Track"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <AddEnquiryComponent mode={mode} />
                </div>
            </main>
        </>
    )
}

const AddEnquiryComponent = ({ mode, onSave }) => {
    const token = Cookies.get("token");
    const userData = useSelector((store) => store.userDetail);
    const isAdmin = !userData?.role || userData?.role === "admin";
    const toast = useMyToaster();
    const navigate = useNavigate();
    const { getApiData } = useApi();
    const { id } = useParams();
    const itemData = { item: '', qty: '' };
    const [formData, setFormData] = useState({
        party: '', contactPerson: '', items: [itemData], deliveryDate: '', enqNo: '',
        message: '', enquirySource: '', enquiryStatus: '', compititor: '', followUp: 'no',
        followUpDate: '', orderProbality: '', expectedOrderDate: '', dateReceived: '', industry: ''
    })
    const [party, setParty] = useState([]);
    const [items, setItems] = useState([]);
    const [contactPerson, setContactPerson] = useState([]);
    const [selectedParty, setSelectedParty] = useState(null);
    const [contactDrawer, setContactDrawer] = useState(false);




    // Get Party and Item
    const getAssignParties = async () => {
        try {
            const url = process.env.REACT_APP_API_URL + `/party/get-assign-party`;
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({ token })
            });
            const res = await req.json();
            if (req.status !== 200 || res.err) {
                toast(res.err, "error");
                return [];
            }

            return res;

        } catch (error) {
            return toast("Party data not get", "error")
        }
    }
    useEffect(() => {
        (async () => {
            let partyData;
            if (isAdmin) {
                partyData = await getApiData("party");
            } else {
                partyData = await getAssignParties();
            }

            const party = partyData.data.map(d => ({ label: d.name, value: d._id }));
            setParty([...party]);


            const itemData = await getApiData("item");
            const item = itemData.data.map(d => ({ label: d.title, value: d._id }));
            setItems([...item]);
        })()
    }, [isAdmin])



    // Get Party Contacts;
    const getParyContact = async () => {
        try {
            const URL = `${process.env.REACT_APP_API_URL}/party-contacts/get-all`;
            const req = await fetch(URL, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({ partyId: selectedParty, token })
            })
            const res = await req.json();

            if (req.status !== 200) {
                return toast(res.err, 'error');
            }

            const contacts = res.data.map(d => ({ label: d.name, value: d._id }));
            setContactPerson([...contacts]);
        } catch (err) {
            return toast("Something went wrong", "error");
        }
    }
    useEffect(() => {
        if (!selectedParty) return;
        getParyContact();
    }, [selectedParty])


    // Get Eqnuiry No.
    useEffect(() => {
        // Edit Mode a return holo karon previous data set hobe
        if (mode) return;

        (async () => {
            try {
                const URL = `${process.env.REACT_APP_API_URL}/enquiry/get-enqno`;
                const req = await fetch(URL, {
                    method: 'POST',
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token })
                })
                const res = await req.json();

                if (req.status !== 200) {
                    return toast(res.err, 'error');
                }
                setFormData({ ...formData, enqNo: res.count.toString() })
            } catch (err) {
                return toast("Something went wrong", "error");
            }
        })()
    }, [])


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
                    dateReceived: res.data.dateReceived?.split("T")[0],
                    expectedOrderDate: res.data.expectedOrderDate?.split("T")[0],
                    followUpDate: res.data.followUpDate?.split("T")[0],
                    party: res.data.party._id, contactPerson: res.data.contactPerson._id
                });
                setSelectedParty(res.data.party);
            } catch (er) {
                return toast("Data not fetch", 'error');
            }
        })()
    }, [mode])


    const saveData = async (e) => {
        const validations = [
            { field: formData.party, msg: "Select party" },
            { field: formData.enqNo, msg: "Contact personal is required" },
            { field: formData.contactPerson, msg: "Contact personal is required" },
        ];

        for (const item of validations) {
            if (!item.field || item.field.trim() === "") {
                return toast(item.msg, "error");
            }
        }

        if (formData.items.length === 0 || formData.items.some(i => !i.item || !i.qty)) {
            return toast("Please add item with quantity", "error");
        }

        try {
            const url = process.env.REACT_APP_API_URL + "/enquiry/add";
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
            navigate("/admin/enquiry")
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

    const clearData = (e) => {
        setFormData({
            party: '', contactPerson: '', items: [itemData], deliveryDate: '', enqNo: '',
            message: '', enquirySource: '', enquiryStatus: '', compititor: '', followUp: 'no',
            followUpDate: '', orderProbality: '', expectedOrderDate: '', dateReceived: '', industry: ''
        })
    }

    return (
        <>
            <AddContactDrawer
                partyId={selectedParty}
                open={contactDrawer}
                onClose={(v) => {
                    setContactDrawer(v);
                    getParyContact();
                }}
            />
            <div className='content__body__main bg-white '>
                <div className='justify-between grid grid-cols-1 md:grid-cols-2 gr gap-4'>
                    <div className='flex items-center gap-4'>
                        <div className='w-full'>
                            <p>Select Party <span className='required__text'>*</span></p>
                            <SelectPicker
                                className='w-full'
                                menuMaxHeight={200}
                                data={party}
                                onChange={(v) => {
                                    setFormData({ ...formData, party: v });
                                    setSelectedParty(v);
                                }}
                                onClean={() => {
                                    setContactPerson([]);
                                    setSelectedParty(null);
                                }}
                                value={formData.party}
                            />
                        </div>

                        <div className='w-full'>
                            <div className='w-full flex items-center justify-between mb-1'>
                                <p>Contact Person <span className='required__text'>*</span></p>
                                {
                                    selectedParty && (
                                        <button
                                            onClick={() => setContactDrawer(true)}
                                            className='bg-blue-400 rounded py-[2px] text-white px-1 text-[10px]'>
                                            <Icons.ADD className='inline' /> Add Contact
                                        </button>
                                    )
                                }
                            </div>
                            <SelectPicker
                                className='w-full'
                                menuMaxHeight={200}
                                data={contactPerson}
                                onChange={(v) => {
                                    setFormData({ ...formData, contactPerson: v })
                                }}
                                value={formData.contactPerson}
                            />
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='w-full'>
                            <p>Industry</p>
                            <input type="text"
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                value={formData.industry}
                            />
                        </div>
                        <div className='w-full'>
                            <p>Enq No. <span className='required__text'>*</span></p>
                            <input type="text"
                                onChange={(e) => {
                                    setFormData({ ...formData, enqNo: e.target.value })
                                }}
                                value={formData.enqNo}
                                disabled={true}
                            />
                        </div>
                        {/* <div className='w-full'>
                            <p>Expected Delivery Date <span className='required__text'>*</span></p>
                            <input type="date"
                                onChange={(e) => {
                                    setFormData({ ...formData, deliveryDate: e.target.value })
                                }}
                                value={formData.deliveryDate}
                            />
                        </div> */}
                        <div className='w-full'>
                            <p>Date Received <span className='required__text'>*</span></p>
                            <input type="date"
                                onChange={(e) => {
                                    setFormData({ ...formData, dateReceived: e.target.value })
                                }}
                                value={formData.dateReceived}
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 p-1 mt-2 rounded">
                    <button
                        onClick={() => {
                            setFormData({ ...formData, items: [...formData.items, itemData] })
                        }}
                        className="font-semibold text-[11px] bg-blue-500 cursor-pointer px-2 py-[2px] rounded text-white mx-1">
                        Add New +
                    </button>
                    {
                        formData?.items?.map ? formData.items.map((d, i) => (
                            <div key={i} className='w-full flex items-center gap-4 mb-2 mt-1 px-1'>
                                <div className='w-full'>
                                    <MySelect2
                                        model={Constants.ITEM}
                                        onType={(v) => {
                                            setFormData((pv) => {
                                                const newItems = [...pv.items];
                                                newItems[i].item = v;
                                                return { ...pv, items: newItems }
                                            })
                                        }}

                                        value={formData.items[i].item}
                                    />
                                </div>
                                <div className='w-full'>
                                    <input type="text"
                                        placeholder='Quantity'
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val !== "" && !/^\d+$/.test(val)) return;
                                            const newItem = formData.items.map((item, index) => {
                                                if (index === i) {
                                                    return { ...item, qty: val }
                                                }
                                                return item;
                                            })
                                            setFormData({ ...formData, items: newItem })
                                        }}
                                        value={d.qty}
                                    />
                                </div>
                                <div>
                                    <button className='bg-red-500 p-1 rounded text-white'
                                        onClick={() => {
                                            if (formData.items.length === 1) {
                                                setFormData({ ...formData, items: [{ item: '', qty: '' }] })
                                                return;
                                            }
                                            const newItem = formData.items.filter((item, index) => index !== i);
                                            setFormData({ ...formData, items: newItem })
                                        }}>
                                        <Icons.DELETE size={17} />
                                    </button>
                                </div>
                            </div>
                        )) : null
                    }
                </div>
                <div className='justify-between grid grid-cols-1 md:grid-cols-4 gr gap-4 mt-3'>
                    <div className='w-full'>
                        <p>Enquiry Source</p>
                        <select
                            onChange={(e) => setFormData({ ...formData, enquirySource: e.target.value })}
                            value={formData.enquirySource}
                        >
                            <option value="">Select</option>
                            <option value="indiamart">IndiaMart</option>
                            <option value="sulekha">Sulekha</option>
                            <option value="google">Google</option>
                            <option value="justdial">JustDial</option>
                            <option value="others">Others</option>
                        </select>
                    </div>
                    <div className='w-full'>
                        <p>Enquiry Status</p>
                        <select
                            onChange={(e) => setFormData({ ...formData, enquiryStatus: e.target.value })}
                            value={formData.enquiryStatus}
                        >
                            <option value="">Select</option>
                            <option value="open">Open</option>
                            <option value="close">Close</option>
                            <option value="followup">Follow Up</option>
                            <option value="succeed">Succeed</option>
                        </select>
                    </div>

                    <div className='w-full'>
                        <p>Compititor</p>
                        <input type="text"
                            onChange={(e) => setFormData({ ...formData, compititor: e.target.value })}
                            value={formData.compititor}
                        />
                    </div>
                    <div className='w-full'>
                        <p>Order Probablity (%)</p>
                        <input type="text"
                            onChange={(e) => setFormData({ ...formData, orderProbality: e.target.value })}
                            value={formData.orderProbality}
                        />
                    </div>
                    <div className='w-full'>
                        <p>Expected Order Date</p>
                        <input type="date"
                            onChange={(e) => setFormData({ ...formData, expectedOrderDate: e.target.value })}
                            value={formData.expectedOrderDate}
                        />
                    </div>
                    <div className='w-full'>
                        <p>Follow Up</p>
                        <select
                            onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
                            value={formData.followUp}
                        >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    {
                        formData.followUp === "yes" && (
                            <div className='w-full'>
                                <p>Follow Up Date</p>
                                <input type="date"
                                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                                    value={formData.followUpDate}
                                />
                            </div>
                        )
                    }
                </div>

                <div className='mt-2'>
                    <p>Remark</p>
                    <textarea rows={3}
                        onChange={(e) => {
                            setFormData({ ...formData, message: e.target.value })
                        }}
                        value={formData.message}
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
        </>
    )
}

export {
    AddEnquiryComponent
}
export default AddEnquiry;
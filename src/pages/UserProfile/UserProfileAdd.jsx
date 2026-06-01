import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import { LuFileX2, LuRefreshCcw } from "react-icons/lu";
import { MdOutlineRemoveRedEye, MdUploadFile } from "react-icons/md";
import checkfile from '../../helper/checkfile';
import useMyToaster from "../../hooks/useMyToaster";
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import Loading from '../../components/Loading';
import { Icons } from '../../helper/icons';
import { useParams } from 'react-router-dom';
import { TagPicker } from 'rsuite';
import useApi from '../../hooks/useApi';



const UserProfileAdd = ({ mode }) => {
    const toast = useMyToaster();
    const { getApiData } = useApi();
    const token = Cookies.get("token");
    const { id } = useParams();
    const [profilePasswordField, setProfilePasswordField] = useState(false);
    const [currentPasswordField, setCurrentPasswordField] = useState(false);
    const [newPasswordField, setNewPasswordField] = useState(false);
    const [data, setData] = useState({
        name: '', email: '', profile: '', filename: '', status: "",
        parties: []
    });
    const [cPassword, setCPassword] = useState({ currentPassword: '', newPassword: '' });
    const userData = useSelector((state) => state.userDetail);
    const [visible, setVisible] = useState(1); // 1=profile | 2=password;
    const [loading, setLoading] = useState(false);
    const [party, setParty] = useState([]);
    const [userRole, setUserRole] = useState("");



    // Get Party and Item
    useEffect(() => {
        (async () => {
            const partyData = await getApiData("party");
            const party = partyData.data.map(d => ({ label: d.name, value: d._id }));
            setParty([...party]);
        })()
    }, [])

    useEffect(() => {
        if (mode === "edit") {
            (async () => {
                try {
                    setLoading(true);
                    const URL = `${process.env.REACT_APP_API_URL}/user/get-user-by-id`;
                    const req = await fetch(URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": 'application/json'
                        },
                        body: JSON.stringify({ token, id })
                    });
                    const res = await req.json();
                    if (req.status !== 200) {
                        return toast(res.err, "error");
                    }

                    setData({
                        name: res.name, email: res.email,
                        filename: res.filename, profile: res.profile,
                        status: res.isDisable, parties: res.parties
                    })
                    setUserRole(res.role);
                } catch (error) {
                    console.log(error)
                    return toast("Something went wrong", "error");
                }
                finally {
                    setLoading(false);
                }
            })()
        }
    }, [mode])

    const setFile = async (e) => {
        let validfile = await checkfile(e.target.files[0]);

        if (typeof (validfile) !== 'boolean') return toast(validfile, "error");

        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => {
            setData({ ...data, profile: reader.result, filename: e.target.files[0].name });
        }
    }

    const updateProfile = async (e) => {
        if (data.name === "" || data.email === "") {
            return toast("fill the blank", "error");
        }

        try {
            setLoading(true);
            const url = process.env.REACT_APP_API_URL + "/user/update-user";
            const updateData = { ...data, update: true, token, id }

            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData)
            })
            const res = await req.json();
            setLoading(false);
            if (req.status === 500 || res.err) {
                return toast(res.err, 'error');
            }

            return toast(res.msg, "success")
        } catch (err) {
            console.log(err)
            return toast("Something went wrong", "error");
        }

    }

    const clear = () => {
        setData({ name: '', email: '', profile: '' })
    }



    return (
        <>
            <Nav title={"Update User"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='content__body__main' >
                        <div className='flex justify-between gap-5  flex-col lg:flex-row'>
                            <div className='w-full'>
                                <div>
                                    <p className='ml-1'>Name</p>
                                    <input type="Text" className=' mb-2'
                                        onChange={(e) => setData({ ...data, name: e.target.value })}
                                        value={data.name} />
                                </div>
                                <div>
                                    <p className='ml-1 mt-2'>Email</p>
                                    <input type="email" className=' mb-2'
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                        value={data.email} />
                                </div>
                            </div>
                            <div className='w-full'>
                                <div>
                                    <p className='ml-1'>Image</p>
                                    <div className='file__uploader__div'>
                                        <span className='file__name'>{data.filename}</span>
                                        <div className="flex gap-2">
                                            <input type="file" id="invoiceLogo" className='hidden' onChange={(e) => setFile(e)} />
                                            <label htmlFor="invoiceLogo" className='file__upload' title='Upload'>
                                                <MdUploadFile />
                                            </label>
                                            {
                                                data.filename && <LuFileX2 className='remove__upload ' title='Remove upload' onClick={() => {
                                                    setData({ ...data, filename: "" });
                                                }} />
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className='ml-1 mt-2'>Status</p>
                                    <select className=' mb-2'
                                        onChange={(e) => setData({ ...data, status: e.target.value })}
                                        value={data.status}>
                                        <option value="">Select Status</option>
                                        <option value={false}>Active</option>
                                        <option value={true}>Inactive</option>
                                    </select>
                                </div>

                            </div>
                        </div>
                        {
                            userRole === "sales" && (
                                <div className='w-full'>
                                    <p className='ml-1'>Select Party</p>
                                    <TagPicker
                                        data={party}
                                        className="tag-picker w-full"
                                        onChange={(value) => setData({ ...data, parties: value })}
                                        value={data.parties}
                                    />
                                </div>
                            )
                        }
                        
                        <div className='w-full flex justify-center gap-3 my-3 mt-5'>
                            <button className='add-bill-btn'
                                onClick={updateProfile}>
                                {loading ? <Loading /> : <Icons.CHECK />}
                                Update
                            </button>
                            <div>
                                <button className='reset-bill-btn'
                                    onClick={() => clear()}>
                                    <Icons.RESET />
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default UserProfileAdd
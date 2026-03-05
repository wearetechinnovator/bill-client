import { useEffect, useState } from 'react';
import { Modal, SelectPicker } from 'rsuite';
import useMyToaster from '../hooks/useMyToaster';
import Cookies from 'js-cookie';
import { Icons } from '../helper/icons';
import { Constants } from '../helper/constants';
import useApi from '../hooks/useApi';
import { checkNumber } from '../helper/validation'

const StaffPaymentModal = ({ openModal, openStatus }) => {
    const token = Cookies.get('token');
    const { getApiData } = useApi();
    const toast = useMyToaster();
    const [open, setOpen] = useState(false);
    const currentDate = new Date().toISOString().split("T")[0];
    const [formData, setFormData] = useState({
        paymentType: '', transactionNumber: '', date: currentDate,
        paymentMode: Constants.CASH, account: '', amount: '', remark: ''
    })
    const [account, setAccount] = useState([]);



    // Set modal open state based on prop
    useEffect(() => {
        setOpen(openModal);
    }, [openModal])


    // Get account data for select option
    useEffect(() => {
        const apiData = async () => {
            {
                const data = await getApiData("account");
                const account = data.data.map(d => ({ label: d.accountName, value: d._id }));
                setAccount([...account])
            }
        }

        apiData();
    }, [])

    const savePayment = async () => {
        if (!formData.paymentType)
            return toast("Payment type is required", "error");
        else if (!formData.date)
            return toast("Date is required", "error");
        else if (!formData.amount)
            return toast("Amount is required", "error");
        else if (formData.paymentMode === Constants.CASH && !formData.account)
            return toast("Please select account", "error");



    }


    // Get Accounts from API
    useEffect(() => {
        (async () => {
            try {
                const URL = `${process.env.REACT_APP_API_URL}/account/get`;
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token, all: true })
                })
                const res = await req.json();
                if (req.status !== 200) {
                    return toast(res.err, 'error');
                }

            } catch (err) {
                return toast("Error fetching accounts", 'error');
            }
        })()
    }, [])


    return (
        <Modal size='sm' backdrop='static' open={open} onClose={() => {
            openStatus(false);
            setOpen(false);
        }}>
            <Modal.Header className='border-b pb-2'>
                <Modal.Title>
                </Modal.Title>
                <p className='font-bold'>Make Payment</p>
            </Modal.Header>
            <Modal.Body className='text-xs px-2'>
                <div className='w-full flex items-center gap-4'>
                    <div className='w-full'>
                        <p>Payment type <span className='required__text'>*</span></p>
                        <SelectPicker
                            searchable={false}
                            className='w-full'
                            data={[
                                { label: "Salary", value: "salary" },
                                { label: "Bonus", value: "bonus" },
                                { label: "Advance Payment", value: "advance_payment" },
                            ]}
                            onChange={(v) => setFormData({ ...formData, paymentType: v })}
                            value={formData.paymentType}
                        />
                    </div>
                    <div className='w-full'>
                        <p>Date <span className='required__text'>*</span></p>
                        <input type="date"
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            value={formData.date}
                        />
                    </div>
                </div>
                <div className='mt-4 w-full flex items-center gap-4'>
                    <div className='w-[50%]'>
                        <p>Amount <span className='required__text'>*</span></p>
                        <div className='w-full border rounded flex items-center'>
                            <Icons.RUPES className='w-[30px] h-[20px]' />
                            <input type="text"
                                className='border-none'
                                onChange={(e) => {
                                    if (!checkNumber(e.target.value)) return;
                                    setFormData({ ...formData, amount: e.target.value })
                                }}
                                value={formData.amount}
                            />
                            <select
                                className='border-none rounded-none bg-gray-50'
                                onChange={(e) => {
                                    setFormData({ ...formData, paymentMode: e.target.value })
                                }}
                                value={formData.paymentMode}
                            >
                                <option value={Constants.CASH}>Cash</option>
                                <option value={Constants.UPI}>UPI</option>
                                <option value={Constants.CARD}>Card</option>
                                <option value={Constants.NETBENKING}>Netbenking</option>
                                <option value={Constants.BANK}>Bank</option>
                                <option value={Constants.CHEQUE}>Cheque</option>
                            </select>
                        </div>
                    </div>
                    {
                        formData.paymentMode !== Constants.CASH && (
                            <div className='w-[50%]'>
                                <p>Account</p>
                                <SelectPicker className='w-full'
                                    onChange={(v) => setFormData({ ...formData, account: v })}
                                    data={account}
                                    value={formData.account}
                                />
                            </div>
                        )
                    }
                </div>
                <div className='w-full mt-4'>
                    <p>Remark(Optional)</p>
                    <textarea
                        placeholder='Enter Remarks'
                        onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                        value={formData.remark}
                    ></textarea>
                </div>
                <div className='bg-yellow-50 p-2 rounded mt-4'>
                    <strong>Note: </strong>
                    <span className='text-[11px]'>An expense under the category Employee Salary & Advance will automatically be created for this payment</span>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button
                    onClick={async () => {
                        await savePayment();
                        // setOpen(false);
                        // openStatus(false);
                    }}
                    disabled={
                        !formData.paymentType || !formData.amount || !formData.date
                    }
                    className={`
                        float-end text-white rounded w-[120px] py-1 uppercase text-xs
                        ${!formData.paymentType || !formData.amount || !formData.date ? 'bg-blue-200' : 'bg-blue-600'}
                    `}
                >
                    Save
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default StaffPaymentModal;
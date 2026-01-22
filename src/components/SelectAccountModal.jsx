import { useEffect, useState } from 'react';
import { Modal } from 'rsuite';
import useMyToaster from '../hooks/useMyToaster';
import Cookies from 'js-cookie';

const SelectAccountModal = ({ openModal, openStatus, getAccountDetails }) => {
    const token = Cookies.get('token');
    const toast = useMyToaster();
    const [activeBox, setActiveBox] = useState(null);
    const [open, setOpen] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);


    // Set modal open state based on prop
    useEffect(() => {
        setOpen(openModal);
    }, [openModal])


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
                setAccounts(res.data);

            } catch (err) {
                return toast("Error fetching accounts", 'error');
            }
        })()
    }, [])


    return (
        <Modal size='sm' backdrop='static' open={open} onClose={() => {
            openStatus(false);
            setOpen(false);
            setActiveBox(null);
        }}>
            <Modal.Header className='border-b pb-2'>
                <Modal.Title>
                </Modal.Title>
                <p>Select Account</p>
            </Modal.Header>
            <Modal.Body>
                {
                    accounts?.map((account, i) => {
                        if (account.type !== 'bank') return null;
                        return (
                            <label key={i} className={`flex items-center justify-between text-xs border py-2 cursor-pointer mb-1 p-2 rounded ${activeBox === i ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                                onClick={() => {
                                    setActiveBox(i);
                                    setSelectedAccount(account);
                                }}
                            >
                                <div className='w-full'>
                                    <p>{account.bankName}</p>
                                    <p className='text-gray-500'>Acc No: {account.accountNumber}</p>
                                </div>
                                <div className='flex items-center w-full justify-end'>
                                    <div>
                                        <p className='text-right'>₹{account.openingBalance || 0.00}</p>
                                        <p className='text-gray-500'>IFSC: {account.ifscCode}</p>
                                    </div>
                                    <input type="radio" name='bank' id={`account-${i}`} />
                                </div>
                            </label>
                        )
                    })
                }
            </Modal.Body>
            <Modal.Footer>
                <button 
                onClick={()=>{
                    getAccountDetails(selectedAccount);
                    setOpen(false);
                    openStatus(false);
                    setActiveBox(null);
                }}
                className='float-end bg-blue-600 text-white rounded w-[120px] py-1 uppercase text-xs'>
                    Save
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default SelectAccountModal
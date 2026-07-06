import React, { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import useMyToaster from '../../hooks/useMyToaster';
import { Icons } from '../../helper/icons';


const PoClientView = () => {
    const token = Cookies.get("token");
    const { id } = useParams();
    const toast = useMyToaster();
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState();
    const [salesInv, setSalesInv] = useState([])


    useEffect(() => {
        (async () => {
            try {
                const URL = process.env.REACT_APP_API_URL + `/po-client/get`;
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token, id })
                });
                const res = await req.json();
                if (req.status !== 200) {
                    return toast(res.err, 'error');
                }
                setData(res.data);

            } catch (err) {
                return toast("Sales Invoice not fetch, Something went wrong");
            }
        })()
    }, [])

    // Get Sales Invoice by PO Number
    useEffect(() => {
        if(!data?.poNumber) return;
        (async () => {
            try {
                const URL = process.env.REACT_APP_API_URL + `/po-client/get-sales-invoice`;
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token, poNumber: data.poNumber })
                });
                const res = await req.json();
                if (req.status !== 200) {
                    return toast(res.err, 'error');
                }
                console.log(res)
                setSalesInv(res);

            } catch (err) {
                return toast("Sales Invoice not fetch, Something went wrong");
            }
        })()
    }, [data])

    return (
        <>
            <Nav title={"Client PO"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='content__body__main'>
                        <div className='w-full flex items-center justify-between border-b pb-2'>
                            <p className='font-bold'>
                                <Icons.USER className='inline mr-1' size={12} />
                                General Details
                            </p>
                        </div>
                        <div className='w-full grid gird-cols-1 sm:grid-cols-2 md:grid-cols-4 pb-2 my-3 gap-4'>
                            <div>
                                <p>PARTY NAME</p>
                                <p className='font-bold'>{data?.party?.name}</p>
                            </div>
                            <div>
                                <p>State</p>
                                <p className='uppercase'>{data?.party?.state}</p>
                            </div>
                            <div>
                                <p>City</p>
                                <p>{data?.party?.city}</p>
                            </div>
                            <div>
                                <p>PO NUMBER</p>
                                <p>{data?.poNumber}</p>
                            </div>
                            <div>
                                <p>PO DATE</p>
                                <p>{data?.poDate?.split("T")[0]}</p>
                            </div>
                            <div>
                                <p>PO FILE SOURCE</p>
                                <a href={data?.driveLink} target='_blank' className='underline'>Click Here</a>
                            </div>
                        </div>
                    </div>

                    {/* Item Details */}
                    <div className='content__body__main'>
                        <div className='w-full flex items-center justify-between border-b pb-2'>
                            <p className='font-bold'>
                                <Icons.ITEMS className='inline mr-1' />
                                Item Details
                            </p>
                        </div>

                        <div className="w-full overflow-x-auto mt-4">
                            <table className="w-full min-w-[700px] border-collapse border">
                                <thead>
                                    <tr className="bg-[#F6F7FB]">
                                        <th className="border px-3 py-2 text-left font-bold">Name</th>
                                        <th className="border px-3 py-2 text-center font-bold">QTY</th>
                                        <th className="border px-3 py-2 text-center font-bold">Remining QTY</th>
                                        {/* <th className="border px-3 py-2 text-center font-bold">HSN</th> */}
                                        <th className="border px-3 py-2 text-center font-bold">Unit</th>
                                        <th className="border px-3 py-2 text-right font-bold">Price</th>
                                        <th className="border px-3 py-2 text-right font-bold">Total</th>
                                        <th className="border px-3 py-2 text-right font-bold">GST %</th>
                                        <th className="border px-3 py-2 text-right font-bold">Grand Total</th>
                                        <th className="border px-3 py-2 text-right font-bold">Invoice Number</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {data?.items.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="border px-3 py-2">
                                                {item.itemName}
                                            </td>
                                            <td className="border px-3 py-2 text-center">
                                                {Number(item.qun) + Number(item.invoice_qun)}
                                            </td>
                                            <td className="border px-3 py-2 text-center">
                                                {item.qun}
                                            </td>
                                            {/* <td className="border px-3 py-2 text-center">
                                                {item.hsn}
                                            </td> */}
                                            <td className="border px-3 py-2 text-center">
                                                {item.selectedUnit}
                                            </td>
                                            <td className="border px-3 py-2 text-right">
                                                {item.price}
                                            </td>
                                            <td className="border px-3 py-2 text-right">
                                                {Number(item.qun) * Number(item.price)}
                                            </td>
                                            <td className="border px-3 py-2 text-right">
                                                {item.taxAmount} <span className='text-[10px] text-gray-500'>({item.tax}%)</span>
                                            </td>
                                            <td className="border px-3 py-2 text-right">
                                                {item.amount}
                                            </td>
                                            <td className="border px-3 py-2 text-right">
                                                {
                                                    salesInv?.map((inv, _)=>{
                                                        return <div key={inv._id} >
                                                            <span className='text-xs bg-gray-100 border rounded px-1'>{inv.salesInvoiceNumber}</span>
                                                            {/* <span className='block text-[10px]'>{inv.invoiceDate?.split("T")[0]}</span> */}
                                                        </div>
                                                    })
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </main>
        </>
    )
}


export default PoClientView;
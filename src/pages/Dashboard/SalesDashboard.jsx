import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';
import useMyToaster from "../../hooks/useMyToaster";
import { Constants } from "../../helper/constants";
import { Icons } from "../../helper/icons";
import DashboardInSighnShimmer from "../../components/DashboardInSighnShimmer";
import DataShimmer from "../../components/DataShimmer";
import { useSelector } from "react-redux";



const SalesDashboard = () => {
    const token = Cookies.get("token");
    const toast = useMyToaster();
    const [recentSales, setRecentSales] = useState([]);
    const [insighnLoading, setInsightLoading] = useState(true);
    const [recentInvoiceLoading, setRecentInvoiceLoading] = useState(true);

    // For Sales person
    const [noOfEnq, setNoOfEnq] = useState({ total: 0, today: 0 });
    const [noOfProforma, setNoOfProforma] = useState({ total: 0, today: 0 });
    const [noOfSales, setNoOfSales] = useState({ total: 0, today: 0 });
    const [noOfQuotation, setNoOfQuotation] = useState({ total: 0, today: 0 });


    // Get Recent Sales Invoice
    useEffect(() => {
        (async () => {
            setRecentInvoiceLoading(true);
            try {
                const data = {
                    token: Cookies.get("token"),
                    all: false
                }
                const url = process.env.REACT_APP_API_URL + `/salesinvoice/get?page=${1}&limit=${2}`;
                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                const res = await req.json();
                setRecentSales(res?.data || [])

            } catch (error) {
                console.log(error)
            } finally {
                setRecentInvoiceLoading(false);
            }
        })()
    }, [])

    // All insight functions
    const getNoOfSales = async () => {
        try {
            const url = process.env.REACT_APP_API_URL + `/dashboard/get-no-sales`;
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({ token })
            });
            const res = await req.json();
            if (req.status !== 200) return toast(res.err, "error");

            setNoOfSales({ today: res.today, total: res.total });

        } catch (err) {
            return toast("No of sales no fetch", "error");
        }
    }

    const getNoOfProforma = async () => {
        try {
            const url = process.env.REACT_APP_API_URL + `/dashboard/get-no-proforma`;
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({ token })
            });
            const res = await req.json();
            if (req.status !== 200) return toast(res.err, "error");

            setNoOfProforma({ today: res.today, total: res.total });

        } catch (err) {
            return toast("No of Proforma no fetch", "error");
        }
    }

    const getNoOfQuotation = async () => {
        try {
            const url = process.env.REACT_APP_API_URL + `/dashboard/get-no-quotation`;
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({ token })
            });
            const res = await req.json();
            if (req.status !== 200) return toast(res.err, "error");

            setNoOfQuotation({ today: res.today, total: res.total });

        } catch (err) {
            return toast("No of Proforma no fetch", "error");
        }
    }

    const getNoOfEnquiry = async () => {
        try {
            const url = process.env.REACT_APP_API_URL + `/dashboard/get-no-enquiry`;
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({ token })
            });
            const res = await req.json();
            if (req.status !== 200) return toast(res.err, "error");

            setNoOfEnq({ today: res.today, total: res.total });
        } catch (err) {
            return toast("No of Proforma no fetch", "error");
        }
    }
    // Call this no of functions;
    useEffect(() => {
        (async () => {
            setInsightLoading(true);
            await getNoOfSales();
            await getNoOfProforma();
            await getNoOfQuotation();
            await getNoOfEnquiry();
            setInsightLoading(false);
        })()
    }, [])

    return (
        <>
            <div className="content__body p-4">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="dashboard-main-box col-span-2 shadow">
                        <h1 className="2xl:text-[20px] xl:text-[20px] text-[#333333] font-[600] mb-[10px] text-left">
                            Insights
                        </h1>
                        {
                            insighnLoading === false ? (
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="bg-[#E3EAFF] rounded-[10px] p-4 border shadow">
                                        <div className="flex content-between">
                                            <div className="interaction-left-box w-[85%]">
                                                <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Total Enquiry</h2>
                                                <p className="text-[20px] text-[#333333]">
                                                    {noOfEnq.total}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#E0F8FF] rounded-[10px] p-4 border shadow">
                                        <div className="flex content-between">
                                            <div className="interaction-left-box w-[85%]">
                                                <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Total Quotation</h2>
                                                <p className=" text-[20px] text-[#333333]">
                                                    {noOfQuotation.total}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#E9E9E9] rounded-[10px] p-4 border shadow">
                                        <div className="flex content-between">
                                            <div className="interaction-left-box w-[85%]">
                                                <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Total Proforma</h2>
                                                <p className="text-[20px] text-[#333333]">
                                                    {noOfProforma.total}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#E3FFFA] rounded-[10px] p-4 border shadow">
                                        <div className="flex content-between">
                                            <div className="interaction-left-box w-[85%]">
                                                <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Total Sales</h2>
                                                <p className="text-[20px] text-[#333333]">
                                                    {noOfSales.total}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#FFFEEF] rounded-[10px] p-4 border shadow">
                                        <div className="flex content-between">
                                            <div className="interaction-left-box w-[85%]">
                                                <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Today Enquiry</h2>
                                                <p className="text-[20px] text-[#333333]">
                                                    {noOfEnq.today}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#E2FFED] rounded-[10px] p-4 border shadow">
                                        <div className="flex content-between">
                                            <div className="interaction-left-box w-[85%]">
                                                <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Today Quotation</h2>
                                                <p className="text-[20px] text-[#333333]">
                                                    {noOfQuotation.today}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#FEF2FF] rounded-[10px] p-4 border shadow">
                                        <div className="flex content-between">
                                            <div className="interaction-left-box w-[85%]">
                                                <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Today Proforma</h2>
                                                <p className="text-[20px] text-[#333333]">
                                                    {noOfProforma.today}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#FFD9DA] rounded-[10px] p-4 border shadow">
                                        <div className="flex content-between">
                                            <div className="interaction-left-box w-[85%]">
                                                <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Today Sales</h2>
                                                <p className="text-[20px] text-[#333333]">
                                                    {noOfSales.today}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : <DashboardInSighnShimmer />
                        }

                    </div>
                    <div className="dashboard-main-box w-full shadow">
                        <h1 className="2xl:text-[20px] xl:text-[20px] text-[#333333] font-[600] mb-[10px] text-left">
                            Recent Invoices
                        </h1>
                        <div className="products-status">
                            <table className="table-fixed w-[100%]">
                                <tbody>
                                    {
                                        recentInvoiceLoading === false ? (
                                            recentSales.length > 0 ? (
                                                recentSales.map((rs, i) => {
                                                    let paymentStatus = Constants.UNPAID;
                                                    const paymentAmount = Number(rs.paymentAmount) || 0;

                                                    if (rs.finalAmount === paymentAmount) {
                                                        paymentStatus = Constants.PAID;
                                                    }
                                                    else if (paymentAmount > 0 && paymentAmount < rs.finalAmount) {
                                                        paymentStatus = Constants.PARTIAL_PAID;
                                                    }

                                                    if (rs.isCancel) {
                                                        return;
                                                    }

                                                    return (
                                                        <tr key={i}>
                                                            <td className="flex items-center gap-[5px] w-[90%] font-(family-name:--heading-font) text-[#333333]">
                                                                {i + 1}. {rs.party.name}
                                                            </td>
                                                            <td className="text-end text-[10px] w-[30%]" >
                                                                <span className={`${paymentStatus === Constants.PAID ? 'green-badge' : paymentStatus === Constants.PARTIAL_PAID ? 'yellow-badge' : 'red-badge'} badge capitalize`}>
                                                                    {paymentStatus}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="text-center text-gray-500 py-4">
                                                        No invoices found
                                                    </td>
                                                </tr>
                                            )
                                        ) : <DataShimmer />
                                    }
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default SalesDashboard;

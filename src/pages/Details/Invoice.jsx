import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { toWords } from 'number-to-words';
import downloadPdf from '../../helper/downloadPdf';
import useMyToaster from '../../hooks/useMyToaster';
import MailModal from '../../components/MailModal';
import { useDispatch, useSelector } from 'react-redux';
import { toggle } from '../../store/mailSlice';
import { Popover, Whisper } from 'rsuite';
import { MdOutlineArrowDropDown } from "react-icons/md";
import { IoIosShareAlt } from "react-icons/io";
import { HiOutlineMail } from "react-icons/hi";
import { MdOutlineWhatsapp } from "react-icons/md";
import swal from 'sweetalert';
import { Icons } from '../../helper/icons';
import Loading from '../../components/Loading';
import QRCode from "qrcode";
import PaymentInModal from '../../components/PaymentInModal';
import PaymentOutModal from '../../components/PaymentOutModal';
import ConfirmModal from '../../components/ConfirmModal';
import numberToWords from '../../helper/numberToWord';



const Invoice = () => {
    const token = Cookies.get("token");
    const navigate = useNavigate();
    const { id, bill } = useParams();
    const [loading, setLoading] = useState(false);
    const [billData, setBillData] = useState(null);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [hsnData, setHsnData] = useState([]);
    const [billDetails, setBillDetails] = useState({})
    const [totalAmountInText, setTotalAmountInText] = useState("");
    const [urlRoute, setUrlRoute] = useState("");
    const toast = useMyToaster();
    const openModal = useSelector((state) => state.mailModalSlice.show)
    const dispatch = useDispatch();
    const [pdfData, setPdfData] = useState(null);
    const [billName, setBillName] = useState('');
    const [shareDrpdwn, setShareDrpdwn] = useState(false);
    const [route, setRoute] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const downloadRef = useRef(null);
    const mainBillRef = useRef(null);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [billNumber, setBillNumber] = useState('');
    const [billDate, setBillDate] = useState('');
    const [accountDetails, setAccountDetails] = useState(null);
    const [qr, setQr] = useState("");
    const [paymentModal, setPaymentModal] = useState(false);
    const [paymentButtonShow, setPaymentButtonShow] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const userData = useSelector((store) => store.userDetail);
    const role = userData.role;
    const [totalAdditionalCharge, setTotalAdditionalCharge] = useState(null);
    const [isAdditionalCharge, setIsAdditionalCharge] = useState(false);



    // Set URL route and Bill Name;
    useEffect(() => {
        if (bill === "quotation") {
            setUrlRoute("quotation");
            setBillName("Quotation");
            setRoute("quotation-estimate");
        } else if (bill === "proforma") {
            setUrlRoute('proforma');
            setBillName("Proforma");
            setRoute("proforma-invoice");
        } else if (bill === 'po') {
            setUrlRoute('po')
            setBillName("Purchase Order");
            setRoute("purchase-order");
        } else if (bill === 'purchaseinvoice') {
            setUrlRoute("purchaseinvoice");
            setBillName("Purchase Invoice");
            setRoute("purchase-invoice");
        } else if (bill === "purchasereturn") {
            setUrlRoute('purchasereturn');
            setBillName("Purchase Return");
            setRoute("purchase-return");
        } else if (bill === 'debitnote') {
            setUrlRoute("debitnote");
            setBillName("Debitnote");
            setRoute("debit-note");
        } else if (bill === 'salesinvoice') {
            setUrlRoute("salesinvoice");
            setBillName("Sales Invoice");
            setRoute("sales-invoice");
        } else if (bill === 'salesreturn') {
            setUrlRoute("salesreturn");
            setBillName("Sales Return");
            setRoute("sales-return");
        } else if (bill === 'creditnote') {
            setUrlRoute("creditnote");
            setBillName("Creditnote");
            setRoute("credit-note");
        } else if (bill === 'deliverychalan') {
            setUrlRoute("deliverychalan");
            setBillName("Delivery Chalan");
            setRoute("delivery-chalan");
        }
    }, [bill])


    // Get bill information And Get company information;
    useEffect(() => {
        // Get bill information
        const getData = async () => {
            try {
                setLoading(true);
                if (urlRoute) {
                    const url = process.env.REACT_APP_API_URL + `/${urlRoute}/get`;
                    const req = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": 'application/json'
                        },
                        body: JSON.stringify({ token, id: id })
                    });
                    const res = await req.json();
                    if (req.status === 200) {
                        setBillData(res.data)
                        console.log("Billdata", res.data.placeOfSupply)

                        setBillNumber(
                            res.data?.quotationNumber ||
                            res.data?.proformaNumber ||
                            res.data?.purchaseInvoiceNumber ||
                            res.data?.purchaseReturnNumber ||
                            res.data?.debitNoteNumber ||
                            res.data?.salesInvoiceNumber ||
                            res.data?.salesReturnNumber ||
                            res.data?.creditNoteNumber ||
                            res.data?.chalanNumber ||
                            res.data?.poNumber
                        );
                        setBillDate(
                            res.data?.estimateDate || res.data?.invoiceDate || res.data?.debitNoteDate ||
                            res.data?.returnDate || res.data?.poDate || res.data?.purchaseInvoiceDate
                            || res.data?.creditNoteDate || res.data?.purchaseReturnDate
                            || res.data?.chalanDate
                        );
                        setAccountDetails(res.data.accountId || null);

                        if (Number(res.data?.paymentAmount || 0) < res.data?.finalAmount && res.data?.isCancel === false) {
                            setPaymentButtonShow(true);
                        } else {
                            setPaymentButtonShow(false)
                        }

                        // Genareate QRCode;
                        if (res.data.accountId && res.data.accountId?.upiId) {
                            const account = res.data.accountId;
                            const upiLink = `upi://pay?pa=${account.upiId}&pn=${account.accountHolderName}&am=${res.data.finalAmount}&cu=INR`;
                            QRCode.toDataURL(upiLink).then(setQr);
                        }


                        // Set Total Additional Charge;
                        const totalAdditionalCharge = res?.data?.additionalCharge.reduce((acc, i) => {
                            return acc += i.amount;
                        }, 0);
                        if (totalAdditionalCharge > 0) setIsAdditionalCharge(true)
                        setTotalAdditionalCharge(totalAdditionalCharge);
                    }
                    return res;
                }

            } catch (error) {
                return error;
            } finally {
                setLoading(false);
            }
        }

        // Get company information;
        const getCompanyDetails = async () => {
            try {
                const url = process.env.REACT_APP_API_URL + `/company/get`;
                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token: Cookies.get("token") })
                });
                const res = await req.json();
                setCompanyDetails(res);
                return res;

            } catch (error) {
                console.log(error)
                return error;
            }
        }

        getCompanyDetails()
        getData();

    }, [urlRoute, paymentModal, openConfirm])


    // FIXED: HSN data calculation to properly aggregate items with same HSN
    useEffect(() => {
        if (!billData || !billData.items) return;

        const hsnMap = {};

        billData.items.forEach((b) => {
            const hsn = b.hsn;
            const qty = Number(b.qun) || 0;
            const price = Number(b.price) || 0;
            const taxRate = Number(b.tax) || 0;
            const discont = Number(b.discountPerAmount) || 0;


            const taxableValue = qty * price - discont;
            const taxAmount = (taxableValue * taxRate) / 100;

            if (hsnMap[hsn]) {
                hsnMap[hsn].taxableValue += taxableValue;
                hsnMap[hsn].taxAmount += taxAmount;
            } else {
                hsnMap[hsn] = {
                    hsn,
                    rate: taxRate,
                    taxableValue,
                    taxAmount
                };
            }
        });

        setHsnData(Object.values(hsnMap));
    }, [billData]);


    // All Total Amount Calculation
    useEffect(() => {
        let qun = 0;
        let taxAmount = 0;
        let discount = 0;
        let amount = 0;

        billData && billData.items.map((b, _) => {
            qun += parseInt(b.qun)
            taxAmount += ((parseInt(b.qun) * parseInt(b.price) - b.discountPerAmount)) / 100 * b.tax;
            discount += parseInt(b.discountPerAmount || 0);

            const q = Number(b.qun) || 0;
            const p = Number(b.price) || 0;
            const d = Number(b.discountPerAmount) || 0;
            const taxRate = Number(b.tax) || 0;

            const taxableAmount = q * p - d;
            const taxAmount1 = (taxableAmount / 100) * taxRate;
            const a = taxableAmount + taxAmount1;

            amount += a
        })

        setBillDetails({
            ...billDetails,
            qun,
            taxAmount: (taxAmount).toFixed(2),
            discount,
            amount: (amount).toFixed(2)
        })

        // setTotalAmountInText(toWords(amount || 0));
        setTotalAmountInText(numberToWords(amount || 0))


    }, [billData])


    // SendBill via Mail
    const sendViaMail = async () => {
        function blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
            });
        }

        try {
            const html = document.getElementById('mainBill').innerHTML;

            const response = await fetch(`${process.env.REACT_APP_API_URL}/generate-pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html })
            });

            const blob = await response.blob();
            let pdfData = await blobToBase64(blob);
            console.log(pdfData)
            setPdfData(pdfData);

            dispatch(toggle(true)) //open modal
        } catch (error) {
            console.log(error)
            toast("Something went wrong", 'error')
            return error;
        }
    }


    // Download Bill
    const downloadBill = async (filename = "invoice") => {
        try {
            setDownloadLoading(true);
            const html = document.getElementById('mainBill').innerHTML;

            const response = await fetch(`${process.env.REACT_APP_API_URL}/generate-pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html })
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.pdf`;
            a.click();

            window.URL.revokeObjectURL(url);

            setDownloadLoading(false);
        } catch (err) {
            setDownloadLoading(false);
            return toast("Invoice not download", 'error');
        }

    }


    // Print Bill;
    const printBill = () => {
        function applyPrintStyle() {
            const style = document.createElement("style");
            style.innerHTML = `
                @media print {
                    body {
                        margin: 0;
                    }

                    body * {
                        visibility: hidden;
                    }

                    #mainBill, #mainBill * {
                        visibility: visible;
                    }

                    #mainBill {
                        position: absolute;
                        left: 0;
                        top: 0;
                        border: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        applyPrintStyle();
        window.print();

    }

    // Cancel Invoice ::Only for Sales
    const cancelInvoice = async () => {
        try {
            const URL = `${process.env.REACT_APP_API_URL}/salesinvoice/cancel-invoice`;
            const req = await fetch(URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token, id })
            });
            const res = await req.json();
            if (req.status !== 200) {
                return toast(res.err, 'error');
            }

            setOpenConfirm(false); // Close Confirm Modal;
            return toast(res.msg, 'success');

        } catch (err) {
            return toast("Something went wrong", 'error');
        }
    }

    return (
        <>
            <Nav />
            <main id='main'>
                <SideNav />
                {
                    bill === "salesinvoice" && (
                        <PaymentInModal
                            invoice={billData}
                            openModal={paymentModal}
                            openStatus={() => {
                                setPaymentModal(false);
                            }}
                        />
                    )
                }

                {
                    bill === "purchaseinvoice" && (
                        <PaymentOutModal
                            invoice={billData}
                            openModal={paymentModal}
                            openStatus={() => {
                                setPaymentModal(false);
                            }}
                        />
                    )
                }
                <MailModal
                    open={openModal}
                    pdf={pdfData}
                    email={billData?.party?.email}
                />
                <ConfirmModal
                    openConfirm={openConfirm}
                    isDel={false}
                    openStatus={(status) => { setOpenConfirm(status) }}
                    title={"Are you sure you want to cancel this invoice?"}
                    fun={() => {
                        cancelInvoice();
                    }}
                />

                <div className="content__body">
                    <div className='content__body__main w-[100%] min-h-[100vh] bg-[#C4E9F7] flex justify-center'>
                        <div className='bg-white /*w-[190mm]*/ w-[80%]  p-5'>

                            {/* Action buttons */}
                            {
                                !loading ? (
                                    <div className='flex items-center justify-between mb-5 bg-gray-50 p-2'>
                                        <div id='invoiceBtn' className='flex gap-2 items-center'>
                                            <button
                                                onClick={downloadLoading ? null : () => downloadBill(`${billNumber}-${billData?.party.name}`)}
                                                title='PDF'
                                                className='bg-[#003E32] text-white rounded-[5px] flex justify-center items-center px-2 py-[5px]'>
                                                {
                                                    downloadLoading ?
                                                        <Loading className="text-[15px]" />
                                                        : <Icons.DOWNLOAD className="text-white text-[15px]" />
                                                }
                                                <span className='ml-1'>Download</span>
                                            </button>

                                            <Whisper
                                                trigger={'click'}
                                                placement='bottomEnd'
                                                open={shareDrpdwn}
                                                onClick={() => setShareDrpdwn(!shareDrpdwn)}
                                                speaker={<Popover>
                                                    <div
                                                        onClick={() => {
                                                            sendViaMail()
                                                            setShareDrpdwn(false)
                                                        }}
                                                        className='flex items-center gap-2 w-[120px] p-1 cursor-pointer hover:bg-[#C4E9F7] rounded'>
                                                        <HiOutlineMail className='text-[16px]' />
                                                        Email
                                                    </div>
                                                    <div className='flex items-center gap-2 w-[120px] p-1 cursor-pointer hover:bg-[#C4E9F7] rounded'>
                                                        <MdOutlineWhatsapp className='text-[16px]' />
                                                        WhatsApp
                                                    </div>
                                                </Popover>}
                                            >
                                                <div
                                                    className='flex items-center gap-3 bg-[#003E32] text-white rounded-[5px] px-2 py-[5px] cursor-pointer'>
                                                    <div className='flex items-center gap-1'>
                                                        <IoIosShareAlt />
                                                        Share
                                                    </div>
                                                    <MdOutlineArrowDropDown />
                                                </div>
                                            </Whisper>
                                        </div>

                                        <div className='flex items-center gap-4'>
                                            {
                                                paymentButtonShow && (bill === "salesinvoice" || bill === "purchaseinvoice") && (
                                                    <button className='payment__button' onClick={() => setPaymentModal(true)}>
                                                        <Icons.RUPES className='inline' />
                                                        {
                                                            bill === "purchaseinvoice" ? "Record Payment Out" : bill === "salesinvoice" ? "Record Payment In" : ""
                                                        }
                                                    </button>
                                                )
                                            }
                                            <div className='flex justify-end'>
                                                <Whisper
                                                    placement='leftStart'
                                                    trigger={"click"}
                                                    speaker={<Popover full>
                                                        {
                                                            (
                                                                billData?.paymentAmount === undefined ||
                                                                billData?.isCancel === undefined ||
                                                                (
                                                                    Number(billData.paymentAmount) <= 0 &&
                                                                    billData.isCancel === false
                                                                )
                                                            ) && (
                                                                <div
                                                                    className="download__menu w-[120px]"
                                                                    title="Edit Bill"
                                                                    onClick={() => navigate(`/admin/${route}/edit/${id}`)}
                                                                >
                                                                    <Icons.EDIT className="text-[15px]" />
                                                                    Edit
                                                                </div>
                                                            )
                                                        }

                                                        {
                                                            role !== "sales" && (
                                                                <div className='download__menu'
                                                                    onClick={() => {
                                                                        swal({
                                                                            title: "Are you sure?",
                                                                            icon: "warning",
                                                                            buttons: true,
                                                                        })
                                                                            .then((cnv) => {
                                                                                if (cnv) {
                                                                                    swal("Quotation successfully duplicate", {
                                                                                        icon: "success",
                                                                                    });
                                                                                    navigate(`/admin/${route}/add/${id}`)
                                                                                }
                                                                            });
                                                                    }}
                                                                >
                                                                    <Icons.COPY />
                                                                    Clone
                                                                </div>
                                                            )
                                                        }

                                                        <div className='download__menu'
                                                            onClick={printBill}
                                                        >
                                                            <Icons.PRINTER className="text-[15px]" />
                                                            Print
                                                        </div>
                                                        {
                                                            Number(billData?.paymentAmount || 0) <= 0 && billData?.isCancel === false && (
                                                                <div className='download__menu'
                                                                    onClick={() => setOpenConfirm(true)}
                                                                >
                                                                    <Icons.CANCEL className="text-[15px]" />
                                                                    Cancel Invoice
                                                                </div>
                                                            )
                                                        }
                                                    </Popover>}
                                                >
                                                    <div className='record__download' >
                                                        <Icons.MORE />
                                                    </div>
                                                </Whisper>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='shimmer__parent mb-4'>
                                        <div className='animate w-full h-[25px] rounded'></div>
                                    </div>
                                )
                            }

                            {
                                !loading ? (
                                    <div id='mainBill' ref={mainBillRef} className='border border-slate-600 rounded p-4'>
                                        <div ref={downloadRef} id='invoice'>
                                            <p className='font-bold text-center uppercase' style={{ fontSize: "14px", color: "gray" }}>
                                                {
                                                    (() => {
                                                        if (billName === "Sales Invoice") return "Tax Invoice";
                                                        else if (billName === "Proforma") return "Proforma Invoice";
                                                        else return billName
                                                    })()
                                                }
                                            </p>
                                            {bill === 'salesinvoice' && (
                                                <p style={{ textAlign: "center", fontSize: "12px", marginTop: "-3px", color: "gray" }}>
                                                    Original for recipient
                                                </p>
                                            )}

                                            <div className='border border-b-0 w-full mt-1 relative'>
                                                {
                                                    billData?.isCancel && (<h1 className='cancel__invoice'>Cancelled</h1>)
                                                }

                                                <table style={{ width: '100%', borderCollapse: 'collapse' }} className='invoice__header'>
                                                    <tbody>
                                                        <tr>
                                                            {/* Left: Company Info */}
                                                            <td style={{ width: '50%', padding: '8px 12px 8px 0' }}>
                                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                    <tbody>
                                                                        <tr>
                                                                            {/* Company Details */}
                                                                            <td
                                                                                style={{
                                                                                    width: '65%',
                                                                                    fontSize: '12px',
                                                                                    verticalAlign: 'middle',
                                                                                    paddingLeft: '13px',
                                                                                    minWidth: '200px'
                                                                                }}
                                                                            >
                                                                                {companyDetails?.invoiceLogo && (
                                                                                    <img
                                                                                        src={companyDetails?.invoiceLogo}
                                                                                        style={{ width: '110px', height: '90px' }}
                                                                                    />
                                                                                )}

                                                                                <p style={{
                                                                                    margin: '0 0 0px 0',
                                                                                    textTransform: 'capitalize',
                                                                                    maxWidth: "400px",
                                                                                    lineHeight: '14px'
                                                                                }}
                                                                                >
                                                                                    {companyDetails?.address}, {companyDetails?.city},{' '}
                                                                                    {companyDetails?.state}, {companyDetails?.country}
                                                                                    {companyDetails?.pin && `, ${companyDetails?.pin}`}
                                                                                </p>

                                                                                {companyDetails?.gst && (
                                                                                    <p style={{ fontSize: '12px', margin: '0px 0 0 0' }}>
                                                                                        <span
                                                                                            style={{
                                                                                                fontWeight: '600',
                                                                                                color: 'black'
                                                                                            }}
                                                                                        >
                                                                                            GSTIN
                                                                                        </span>{' '}
                                                                                        :&nbsp;&nbsp;
                                                                                        {companyDetails?.gst}
                                                                                    </p>
                                                                                )}


                                                                                {companyDetails?.pan && (
                                                                                    <p style={{ fontSize: '12px', margin: '0px 0 0 0' }}>
                                                                                        <span style={{
                                                                                                fontWeight: '600',
                                                                                                color: 'black'
                                                                                            }}
                                                                                        >
                                                                                            PAN
                                                                                        </span>{' '}
                                                                                        :&nbsp;
                                                                                        {companyDetails?.pan}
                                                                                    </p>
                                                                                )}

                                                                                {companyDetails?.phone && (
                                                                                    <p style={{ fontSize: '12px', margin: '0px 0 0 0' }}>
                                                                                        <span style={{
                                                                                                fontWeight: '600',
                                                                                                color: 'black'
                                                                                            }}
                                                                                        >
                                                                                            MOBILE
                                                                                        </span>{' '}
                                                                                        :&nbsp;
                                                                                        {companyDetails?.phone}
                                                                                    </p>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                            <td style={{
                                                                    width: '22%',
                                                                    padding: '12px 12px 0 0',
                                                                    fontSize: '12px',
                                                                    verticalAlign: 'top',  // ← align to top
                                                                }}
                                                            >
                                                                <table style={{
                                                                        borderCollapse: 'collapse',
                                                                        width: '100%',
                                                                        margin: 'auto'
                                                                    }}
                                                                >
                                                                    <tbody>
                                                                        <tr>
                                                                            <td width={'65%'}
                                                                                style={{
                                                                                    padding: '0 0 4px 0',
                                                                                    fontWeight: '600',
                                                                                    color: 'black'
                                                                                }}
                                                                            >
                                                                                {billName} No:
                                                                            </td>

                                                                            <td style={{
                                                                                    padding: '0 0 4px 0',
                                                                                    fontWeight: '600'
                                                                                }}
                                                                            >
                                                                                {billNumber}
                                                                            </td>
                                                                        </tr>

                                                                        <tr>
                                                                            <td style={{
                                                                                padding: '0 0 4px 0',
                                                                                fontWeight: '600',
                                                                                color: 'black'
                                                                            }}
                                                                            > {billName} Date: </td>

                                                                            <td style={{
                                                                                padding: '0 0 4px 0',
                                                                                fontWeight: '600'
                                                                            }}
                                                                            >{new Date(billDate).toLocaleDateString()} </td>
                                                                        </tr>

                                                                        {/* Quotation */}
                                                                        {billName === 'Quotation' && (
                                                                            <>
                                                                                {billData?.enqNumber && (
                                                                                    <tr>
                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600',
                                                                                                color: 'black'
                                                                                            }}
                                                                                        >
                                                                                            Enquiry Number:
                                                                                        </td>

                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600'
                                                                                            }}
                                                                                        >
                                                                                            {billData?.enqNumber}
                                                                                        </td>
                                                                                    </tr>
                                                                                )}

                                                                                {billData?.deliveryTime && (
                                                                                    <tr>
                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600',
                                                                                                color: 'black'
                                                                                            }}
                                                                                        >
                                                                                            Delivery Time:
                                                                                        </td>

                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600'
                                                                                            }}
                                                                                        >
                                                                                            {billData?.deliveryTime}
                                                                                        </td>
                                                                                    </tr>
                                                                                )}
                                                                            </>
                                                                        )}

                                                                        {/* Proforma */}
                                                                        {billName === 'Proforma' && (
                                                                            <>
                                                                                {billData?.poNumber && (
                                                                                    <tr>
                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600',
                                                                                                color: 'black'
                                                                                            }}
                                                                                        >
                                                                                            PO Number:
                                                                                        </td>

                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600'
                                                                                            }}
                                                                                        >
                                                                                            {billData?.poNumber}
                                                                                        </td>
                                                                                    </tr>
                                                                                )}

                                                                                {billData?.poDate && (
                                                                                    <tr>
                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600',
                                                                                                color: 'black'
                                                                                            }}
                                                                                        >
                                                                                            PO Date:
                                                                                        </td>

                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600'
                                                                                            }}
                                                                                        >
                                                                                            {new Date(
                                                                                                billData.poDate
                                                                                            ).toLocaleDateString()}
                                                                                        </td>
                                                                                    </tr>
                                                                                )}

                                                                                {billData?.deliveryTime && (
                                                                                    <tr>
                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600',
                                                                                                color: 'black'
                                                                                            }}
                                                                                        >
                                                                                            Delivery Time:
                                                                                        </td>

                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600'
                                                                                            }}
                                                                                        >
                                                                                            {billData?.deliveryTime}
                                                                                        </td>
                                                                                    </tr>
                                                                                )}
                                                                            </>
                                                                        )}

                                                                        {/* Sales Invoice */}
                                                                        {billName === 'Sales Invoice' && (
                                                                            <>
                                                                                {billData?.poNumber && (
                                                                                    <tr>
                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600',
                                                                                                color: 'black'
                                                                                            }}
                                                                                        >
                                                                                            PO Number:
                                                                                        </td>

                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600'
                                                                                            }}
                                                                                        >
                                                                                            {billData?.poNumber}
                                                                                        </td>
                                                                                    </tr>
                                                                                )}

                                                                                {billData?.poDate && (
                                                                                    <tr>
                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600',
                                                                                                color: 'black'
                                                                                            }}
                                                                                        >
                                                                                            PO Date:
                                                                                        </td>

                                                                                        <td
                                                                                            style={{
                                                                                                padding: '0 0 4px 0',
                                                                                                fontWeight: '600'
                                                                                            }}
                                                                                        >
                                                                                            {new Date(
                                                                                                billData.poDate
                                                                                            ).toLocaleDateString()}
                                                                                        </td>
                                                                                    </tr>
                                                                                )}
                                                                            </>
                                                                        )}

                                                                        {/* Purchase Order */}
                                                                        {billName === 'Purchase Order' &&
                                                                            billData?.deliveryTime && (
                                                                                <tr>
                                                                                    <td
                                                                                        style={{
                                                                                            padding: '0 0 4px 0',
                                                                                            fontWeight: '600',
                                                                                            color: 'black'
                                                                                        }}
                                                                                    >
                                                                                        Delivery Time:
                                                                                    </td>

                                                                                    <td
                                                                                        style={{
                                                                                            padding: '0 0 4px 0',
                                                                                            fontWeight: '600'
                                                                                        }}
                                                                                    >
                                                                                        {billData?.deliveryTime}
                                                                                    </td>
                                                                                </tr>
                                                                            )}
                                                                    </tbody>
                                                                </table>
                                                            </td>

                                                            {/* Right: Bill Info */}
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <div className='w-full flex items-start gap-6 border-t'>
                                                    <div className='px-3 py-2' style={{ width: '60%' }}>
                                                        <p style={{ fontSize: '12px', fontWeight: "600", color: "black", textTransform: 'uppercase' }}>Billing Address</p>
                                                        <p className='capitalize' style={{ fontSize: '12px', fontWeight: "700", marginTop: '2px' }}>
                                                            {billData?.party.name}
                                                        </p>
                                                        <div style={{ fontSize: '12px', maxWidth: '400px', marginTop: '1px', display: 'block', lineHeight: '14px' }}>
                                                            <span className='capitalize'>{billData?.party.billingAddress}</span>,
                                                            <span className='capitalize'>{billData?.party?.state}</span>,
                                                            <span className='capitalize'>{billData?.party?.country}</span>
                                                            {billData?.party?.postalCode && ","} {billData?.party?.postalCode}
                                                        </div>
                                                        <p style={{ fontSize: '12px', margin: "1px 0px" }}>
                                                            <span className='text-black font-semibold'>Mobile:</span> {billData?.party.contactNumber}
                                                        </p>
                                                        <div className='uppercase text-black' style={{ fontSize: '10px' }}>
                                                            {billData?.party?.gst && (
                                                                <>
                                                                    <span className='font-semibold'>GSTIN:</span> {billData.party.gst}
                                                                </>
                                                            )}

                                                            {billData?.party?.pan && (
                                                                <>
                                                                    <span className='font-semibold ml-2'>PAN:</span> {billData.party.pan}
                                                                </>
                                                            )}
                                                        </div>
                                                        <p style={{ fontSize: '10px', margin: "1px 0px" }} >
                                                            <span className='text-black font-semibold'>POS:</span> <span className='capitalize'>{billData?.placeOfSupply}</span>
                                                        </p>
                                                    </div>

                                                    <div className='p-3' style={{ width: '40%' }}>
                                                        <p style={{ fontSize: '12px', fontWeight: "600", color: "black", textTransform: 'uppercase', textAlign: 'left' }}>
                                                            Shipping Address
                                                        </p>
                                                        <p style={{ fontSize: '12px', maxWidth: '600px', marginTop: '2px' }}>
                                                            <span className='capitalize'>{billData?.party.shippingAddress}</span>,
                                                            <span className='capitalize'>{billData?.party?.state}</span>,
                                                            <span className='capitalize'>{billData?.party?.country}</span>
                                                            {billData?.party?.postalCode && ","} {billData?.party?.postalCode}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ========================= [ITEMS TABLE] ===================== */}
                                            {/* ===============================================================*/}
                                            <div className='table__wrapper items-page'>
                                                <table className='w-full border item__table' style={{ fontSize: '12px' }}>
                                                    <thead className='bg-[#C4E9F7]' style={{ background: "#C4E9F7" }}>
                                                        <tr>
                                                            <td align='center' valign='center' className='p-2' width={"5%"}>SL.NO</td>
                                                            <td align='center' width={"44%"}>ITEMS</td>
                                                            <td align='center' width={"7%"}>HSN</td>
                                                            <td align='center' width={"6%"}>QTY.</td>
                                                            <td align='center' width={"8%"}>RATE</td>
                                                            <td align='center' width={"10%"}>DISCOUNT</td>  {/* was 8%, increase */}
                                                            <td align='center' width={"10%"}>TAX</td>
                                                            <td align='center' width={"10%"}>AMOUNT</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody className='item__table__body'>
                                                        {
                                                            billData && billData.items.map((data, index) => {
                                                                return <tr key={data._id} className='item__row'>
                                                                    <td valign='top' align='center' className='p-2'>{index + 1}</td>
                                                                    <td valign='top' align='left'>
                                                                        {data.itemName}
                                                                        {data.description && <p className='text-gray-500 text-[10px] mt-1'>{data.description}</p>}
                                                                    </td>
                                                                    <td valign='top' align='center'>{data.hsn}</td>
                                                                    <td valign='top' align='center'>{data.qun} <sub>{data.selectedUnit}</sub></td>
                                                                    <td valign='top' align='center'> {data.price}</td>
                                                                    <td valign='top' align='center'>
                                                                        {data.discountPerAmount || "0.00"}
                                                                        <div className='discount-font text-gray-500'>
                                                                            {
                                                                                isNaN(parseFloat(data.discountPerAmount) / (parseFloat(data.price) * parseFloat(data.qun)) * 100)
                                                                                    ? "(0.00%)"
                                                                                    : `(${((parseFloat(data.discountPerAmount) / (parseFloat(data.price) * parseFloat(data.qun))) * 100).toFixed(2)}%)`
                                                                            }
                                                                        </div>
                                                                    </td>

                                                                    <td valign='top' align='center'>
                                                                        {(() => {
                                                                            const qty = parseFloat(data.qun) || 0;
                                                                            const price = parseFloat(data.price) || 0;
                                                                            const discount = parseFloat(data.discountPerAmount) || 0;
                                                                            const taxRate = parseFloat(data.tax) || 0;
                                                                            const taxableAmount = qty * price - discount;
                                                                            const taxAmount = (taxableAmount / 100) * taxRate;
                                                                            return taxAmount.toFixed(2);
                                                                        })()}
                                                                        <div className='text-gray-500 discount-font'>{`(${data.tax || '0.00'}%)`}</div>
                                                                    </td>
                                                                    <td valign='top' align='center'>
                                                                        {(() => {
                                                                            const qty = parseFloat(data.qun) || 0;
                                                                            const price = parseFloat(data.price) || 0;
                                                                            const discount = parseFloat(data.discountPerAmount) || 0;
                                                                            const taxRate = parseFloat(data.tax) || 0;
                                                                            const taxableAmount = qty * price - discount;
                                                                            const taxAmount = (taxableAmount / 100) * taxRate;
                                                                            const total = taxableAmount + taxAmount;
                                                                            return total.toFixed(2);
                                                                        })()}
                                                                    </td>
                                                                </tr>
                                                            })
                                                        }
                                                        {/* blank space row */}
                                                        <tr>
                                                            <td
                                                                colSpan={8}
                                                                style={{
                                                                    height: `${Math.max(
                                                                        0,
                                                                        195 - (billData?.items.length * 38)
                                                                    )}px`,
                                                                    border: 'none',
                                                                    padding: 0
                                                                }}
                                                            />
                                                        </tr>

                                                    </tbody>
                                                    <tfoot className='w-full'>
                                                        <tr className='font-semibold' style={{ background: "#C4E9F7" }}>
                                                            <td align='right' colSpan={5}>TOTAL</td>
                                                            <td align='center'><Icons.RUPES className='inline -mt-[2px]' />{billDetails.discount}</td>
                                                            <td align='center'><Icons.RUPES className='inline -mt-[2px]' />{billDetails.taxAmount}</td>
                                                            <td align='center'><Icons.RUPES className='inline -mt-[2px]' />{billDetails.amount}</td>
                                                        </tr>

                                                        {billData?.roundOffAmount && <tr className='font-semibold' style={{ background: "#C4E9F7" }}>
                                                            <td colSpan={7} align='center' className='italic'>Round Off</td>
                                                            <td align='center'><Icons.RUPES className='inline -mt-[2px]' />
                                                                {
                                                                    billData.roundOffType === "0" ?
                                                                        "-" + billData?.roundOffAmount :
                                                                        billData?.roundOffAmount
                                                                }
                                                            </td>
                                                        </tr>}
                                                        {
                                                            isAdditionalCharge && billData?.additionalCharge.map((a, _) => {
                                                                return (
                                                                    <tr className='font-semibold'>
                                                                        <td colSpan={7} align='center' className='italic'>{a.particular}</td>
                                                                        <td align='center'><Icons.RUPES className='inline -mt-[2px]' />
                                                                            {a.amount}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                        {(billData?.roundOffAmount || isAdditionalCharge) && (
                                                            <tr className='font-semibold' style={{ background: "#C4E9F7" }}>
                                                                <td colSpan={7} align='center'>SUB TOTAL</td>
                                                                <td align='center'><Icons.RUPES className='inline -mt-[2px]' />
                                                                    {
                                                                        billData.roundOffType === "0" ?
                                                                            (Number(billDetails.amount) - Number(billData?.roundOffAmount) + Number(totalAdditionalCharge)) :
                                                                            Number(billDetails.amount) + Number(billData?.roundOffAmount) + Number(totalAdditionalCharge)
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )}

                                                        <tr className='font-semibold' style={{ background: "#F3F4F6" }}>
                                                            <td colSpan={7} align='right'>Received Amount</td>
                                                            <td align='center'><Icons.RUPES className='inline -mt-[2px]' />{billData?.paymentAmount || "0.00"}</td>
                                                        </tr>
                                                        <tr className='font-semibold' style={{ background: "#F3F4F6" }}>
                                                            <td colSpan={7} align='right'>Balance Due</td>
                                                            <td align='center'>
                                                                <Icons.RUPES className='inline -mt-[2px]' />
                                                                {((Number(billData?.finalAmount) - Number(billData?.paymentAmount)) || 0).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>

                                            {/* ===================[HSN AND TAX TYPES TABLE] ================= */}
                                            {/* ===============================================================*/}
                                            <div className="print-page-break mt-2 ">
                                                <table className='w-full' style={{ fontSize: '12px' }}>
                                                    <thead className='bg-[#C4E9F7]' style={{ background: "#C4E9F7" }}>
                                                        <tr>
                                                            <td align='center'>HSN Code</td>
                                                            <td align='center'>Taxable Value</td>
                                                            <td align='center'>Tax Type</td>
                                                            <td align='center'>Rate</td>
                                                            {companyDetails?.state === (billData?.placeOfSupply || billData?.party.state) && (
                                                                <td align='center'>Amount</td>
                                                            )}
                                                            <td align='center'>Total Tax Amount</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {/* IGST - Inter-state */}
                                                        {hsnData && companyDetails?.state !== (billData?.placeOfSupply || billData?.party.state) && (() => {
                                                            const rows = [];
                                                            const seen = {};

                                                            for (let i = 0; i < hsnData.length; i++) {
                                                                const data = hsnData[i];

                                                                // Skip if we've already seen this HSN
                                                                if (seen[data.hsn]) continue;

                                                                seen[data.hsn] = true;

                                                                const taxableValue = data.taxableValue;
                                                                const igstAmount = (taxableValue * data.rate / 100).toFixed(2);

                                                                rows.push(
                                                                    <tr key={`${i}-igst`}>
                                                                        <td align='center'>{data.hsn}</td>
                                                                        <td align='center'>{taxableValue.toFixed(2)}</td>
                                                                        <td align='center'>IGST</td>
                                                                        <td align='center'>{data.rate}%</td>
                                                                        <td align='center'>{igstAmount}</td>
                                                                    </tr>
                                                                );
                                                            }

                                                            return rows;
                                                        })()}

                                                        {/* SGST/CGST - Intra-state */}
                                                        {hsnData && companyDetails?.state === (billData?.placeOfSupply || billData?.party.state) && (
                                                            [...new Map(hsnData.map(item => [item.hsn, item])).values()].map((data, i) => {
                                                                const taxableValue = data.taxableValue;
                                                                const halfRate = data.rate / 2;
                                                                const sgstAmount = (taxableValue * halfRate / 100).toFixed(2);
                                                                const cgstAmount = (taxableValue * halfRate / 100).toFixed(2);
                                                                const totalTax = (Number(sgstAmount) + Number(cgstAmount)).toFixed(2);

                                                                return (
                                                                    <React.Fragment key={`${i}-cgst`}>
                                                                        <tr>
                                                                            <td align='center' rowSpan={2}>{data.hsn}</td>
                                                                            <td align='center' rowSpan={2}>{taxableValue.toFixed(2)}</td>
                                                                            <td align='center'>SGST</td>
                                                                            <td align='center'>{halfRate}%</td>
                                                                            <td align='center'>{sgstAmount}</td>
                                                                            <td align='center' rowSpan={2}>{totalTax}</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td align='center'>CGST</td>
                                                                            <td align='center'>{halfRate}%</td>
                                                                            <td align='center'>{cgstAmount}</td>
                                                                        </tr>
                                                                    </React.Fragment>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>


                                            <div className='border w-full mt-0 border-t-0'>
                                                <div className='w-full'>
                                                    <p className='p-1 capitalize' style={{ fontSize: '10px' }}>
                                                        <span className='font-bold '>Total Amount (in words) : </span>
                                                        {totalAmountInText}
                                                    </p>
                                                </div>
                                                <div className='w-full flex border-b'>
                                                    {
                                                        accountDetails && (
                                                            <div className='w-full p-2'>
                                                                <p className='font-bold' style={{ fontSize: "12px" }}>Bank Details</p>
                                                                <div className='w-full flex items-center mt-1' style={{ fontSize: '10px' }}>
                                                                    <div style={{ width: "30%" }}>
                                                                        <p className='font-semibold' style={{ lineHeight: '10px' }}>Name :</p>
                                                                        <p className='font-semibold' style={{ lineHeight: '10px' }}>IFC Code :</p>
                                                                        <p className='font-semibold' style={{ lineHeight: '10px' }}>Account No :</p>
                                                                        <p className='font-semibold' style={{ lineHeight: '10px' }}>Bank Name:</p>
                                                                    </div>
                                                                    <div style={{ width: "70%" }}>
                                                                        <p style={{ lineHeight: '10px' }}>{accountDetails?.accountHolderName}</p>
                                                                        <p style={{ lineHeight: '10px' }}>{accountDetails?.ifscCode}</p>
                                                                        <p style={{ lineHeight: '10px' }}>{accountDetails?.accountNumber}</p>
                                                                        <p style={{ lineHeight: '10px' }}>{accountDetails?.branchName}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        accountDetails?.upiId && (
                                                            <div className='border-l w-full p-2'>
                                                                <p className='font-bold text-md'>Payment QR Code</p>
                                                                <div className='w-full flex items-center' style={{ fontSize: '12px' }}>
                                                                    <div className='w-full'>
                                                                        <p className='font-semibold' style={{ lineHeight: '11px' }}>UPI ID :</p>
                                                                        <p className='font-semibold' style={{ lineHeight: '11px' }}>{accountDetails.upiId}</p>
                                                                    </div>
                                                                    <div className='w-full'>
                                                                        <img
                                                                            style={{ height: '80px', float: 'right' }}
                                                                            src={qr} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                                <div className='w-full flex'>
                                                    <div className='p-2' style={{ width: "80%" }}>
                                                        {billData?.note && <p className='font-semibold text-md'>Notes:</p>}
                                                        <p style={{ fontSize: '10px', marginTop: '-3px' }}>{billData?.note}</p>

                                                        <p className='font-semibold text-md' style={{ marginTop: '-1px', fontSize: '10px' }}>Terms & Conditions:</p>
                                                        <ul className='space-y-1' style={{ fontSize: '8px' }}>
                                                            {billData?.terms
                                                                ?.replace(/(\d{1,2}\.)/g, '||$1')   // add separator before each number
                                                                .split('||')
                                                                .filter(t => t.trim())
                                                                .map((term, i) => (
                                                                    <li key={i} style={{ lineHeight: '10px' }}>{term.trim()}</li>
                                                                ))
                                                            }
                                                        </ul>
                                                    </div>
                                                    <div className='border-l text-center p-2 flex flex-col justify-end' style={{ width: "20%" }}>
                                                        {
                                                            companyDetails?.signature && (
                                                                <img src={companyDetails?.signature} alt="signature" className='mx-auto' style={{ height: '60px' }} />
                                                            )
                                                        }
                                                        <p className='mt-2' style={{ fontSize: '10px' }}>
                                                            Authorised Signatory
                                                        </p>
                                                        {/* <p style={{ fontSize: '10px' }}>{companyDetails?.name}</p> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='shimmer__parent'>
                                        <div className='animate w-full h-[700px]'></div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </main>
        </>

    );
}

export default Invoice;

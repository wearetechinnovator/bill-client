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
	const [downloadLoading, setDownloadLoading] = useState(false);
	const [billNumber, setBillNumber] = useState('');
	const [billDate, setBillDate] = useState('');
	const [accountDetails, setAccountDetails] = useState(null);
	const [qr, setQr] = useState("");
	const [paymentModal, setPaymentModal] = useState(false);
	const [paymentButtonShow, setPaymentButtonShow] = useState(null);
	const [openConfirm, setOpenConfirm] = useState(false);



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
						setBillNumber(res.data?.quotationNumber || res.data?.proformaNumber || res.data?.poNumber ||
							res.data?.purchaseInvoiceNumber || res.data?.purchaseReturnNumber || res.data?.debitNoteNumber
							|| res.data?.salesInvoiceNumber || res.data?.salesReturnNumber || res.data?.creditNoteNumber
							|| res.data?.deliveryChalanNumber
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


	useEffect(() => {
		let data = [];

		billData && billData.items.forEach((b, _) => {
			let obj = {};

			obj['hsn'] = b.hsn;
			obj['rate'] = b.tax;
			obj['qun'] = b.qun;

			if (data.length > 0) {
				for (let i = 0; i < data.length; i++) {
					if (obj.hsn == data[i].hsn) {
						data[i]['price'] += parseInt(b.price);
						obj['price'] = parseInt(data[i].price);

						data[i]['taxAmount'] += (parseInt(b.qun) * parseInt(b.price)) / 100 * parseInt(b.tax);
						obj['taxAmount'] = parseInt(data[i]['taxAmount']);

						break;
					} else {
						obj['price'] = parseInt(b.price);
						obj['taxAmount'] = (parseInt(b.qun) * parseInt(b.price)) / 100 * parseInt(b.tax);
					}

				}

			} else {
				obj['price'] = parseInt(b.price);
				obj['taxAmount'] = (parseInt(b.qun) * parseInt(b.price)) / 100 * parseInt(b.tax)
			}

			data.push(obj)
		})

		setHsnData([...data]);
	}, [billData]);


	useEffect(() => {
		let qun = 0;
		let taxAmount = 0;
		let discount = 0;
		let amount = 0;

		billData && billData.items.map((b, _) => {
			qun += parseInt(b.qun)
			taxAmount += (parseInt(b.qun) * parseInt(b.price)) / 100 * b.tax;
			discount += parseInt(b.discountPerAmount || 0);

			let a = ((parseInt(b.qun) * parseInt(b.price)) + (parseInt(b.qun) * parseInt(b.price)) / 100 * b.tax);
			amount += a - parseInt(b.discountPerAmount || 0);
		})

		setBillDetails({
			...billDetails, qun, taxAmount: (taxAmount).toFixed(2), discount, amount: (amount).toFixed(2)
		})

		setTotalAmountInText(toWords(amount || 0));

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
					<div className='content__body__main w-[100%] min-h-[100vh] bg-gray-100 flex justify-center'>
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
														className='flex items-center gap-2 w-[120px] p-1 cursor-pointer hover:bg-gray-100 rounded'>
														<HiOutlineMail className='text-[16px]' />
														Email
													</div>
													<div className='flex items-center gap-2 w-[120px] p-1 cursor-pointer hover:bg-gray-100 rounded'>
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
															Number(billData?.paymentAmount || 0) <= 0 && billData?.isCancel === false && (
																<div className='download__menu w-[120px]'
																	title='Edit Bill'
																	onClick={() => navigate(`/admin/${route}/edit/${id}`)}
																>
																	<Icons.EDIT className="text-[15px]" />
																	Edit
																</div>
															)
														}

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
									<div id='mainBill' className='border border-slate-600 rounded p-4'>
										<div ref={downloadRef} id='invoice'>
											<p className='font-bold text-center uppercase'>{billName}</p>
											<div className='border border-b-0 w-full mt-3 relative'>
												{
													billData?.isCancel && (
														<h1 className='cancel__invoice'>Cancelled</h1>
													)
												}

												<div className='flex w-full border-b'>
													<div className='p-3 flex items-center gap-5 border-r' style={{ width: "60%" }}>
														<div>
															{
																companyDetails?.invoiceLogo && (
																	<img src={companyDetails?.invoiceLogo} style={{ height: "100px", width: '100px' }} />
																)
															}
														</div>
														<div className='flex flex-col gap-1' style={{ fontSize: '12px' }}>
															<p className='text-blue-700 font-bold' style={{ fontSize: '12px' }}>
																{companyDetails?.name}
															</p>
															<p>{companyDetails?.address}</p>
															<p style={{ lineHeight: '0' }}>
																<span className='font-semibold'>GSTIN</span>:  {companyDetails?.gst}
															</p>
															<p><span className='font-semibold'>PAN</span>: {companyDetails?.pan}</p>
															<p style={{ lineHeight: '0' }}>
																<span className='font-semibold'>Mobile</span>:  {companyDetails?.phone}
															</p>
														</div>
													</div>
													<div className='flex flex-col justify-center px-3' style={{ fontSize: '12px', width: '40%' }}>
														<p><span className='font-semibold'>{billName} No: </span>{billNumber}</p>
														<p><span className='font-semibold'>{billName} Date: </span>{new Date(billDate).toLocaleDateString()}
														</p>
													</div>
												</div>

												<div className='p-3'>
													<p style={{ fontSize: '12px' }}>TO</p>
													<p className='text-black font-semibold uppercase' style={{ fontSize: '12px' }}>
														{billData?.party.name}
													</p>
													<p style={{ fontSize: '12px' }}>
														<span className='text-black font-semibold'>Address:</span> {billData?.party.billingAddress}
													</p>
													<p style={{ fontSize: '12px' }}>
														<span className='text-black font-semibold'>Mobile:</span> {billData?.party.contactNumber}
													</p>
													<p className='uppercase text-black' style={{ fontSize: '12px' }}>
														<span className='font-semibold'>GSTIN:</span> {billData?.party.gst}
														<span className='font-semibold ml-2'>PAN:</span> {billData?.party.pan}
													</p>
												</div>
											</div>
											<div className='table__wrapper items-page'>
												<table className='w-full border item__table' style={{ fontSize: '12px' }}>
													<thead className='bg-gray-100'>
														<tr>
															<td align='center' valign='center' className='p-2' width={"5%"}>SL.NO</td>
															<td align='center' width={"49%"}>ITEM</td>
															<td align='center' width={"7%"}>HSN/SAC</td>
															<td align='center' width={"7%"}>QTY.</td>
															<td align='center' width={"7%"}>RATE</td>
															<td align='center' width={"8%"}>DISCOUNT</td>
															<td align='center' width={"8%"}>TAX</td>
															<td align='center' width={"10%"}>AMOUNT</td>
														</tr>
													</thead>
													<tbody>
														{
															billData && billData.items.map((data, index) => {
																return <tr key={data._id}>
																	<td valign='top' align='center' className='p-2 border'>{index + 1}</td>
																	<td valign='top' align='left'>
																		{data.itemName}
																		{data.description && <p className='text-gray-500 text-[10px] mt-1'>{data.description}</p>}
																	</td>
																	<td valign='top' align='right'>{data.hsn}</td>
																	<td valign='top' align='right'>{data.qun} <sub>{data.selectedUnit}</sub></td>
																	<td valign='top' align='right'>{data.price}</td>
																	<td valign='top' align='right'>
																		{data.discountPerAmount || "0.00"}
																		<div className='discount-font text-gray-500'>
																			{
																				isNaN(parseFloat(data.discountPerAmount) / (parseFloat(data.price) * parseFloat(data.qun)) * 100)
																					? "(0.00%)"
																					: `(${((parseFloat(data.discountPerAmount) / (parseFloat(data.price) * parseFloat(data.qun))) * 100).toFixed(2)}%)`
																			}
																		</div>
																	</td>
																	<td valign='top' align='right'>
																		{((data.qun * data.price) / 100 * data.tax).toFixed(2)}
																		<div className='text-gray-500 discount-font'>{`(${data.tax || '0.00'}%)`}</div>
																	</td>
																	<td valign='top' align='right'> {
																		(parseFloat(data.price) * parseFloat(data.qun) - parseFloat(data.discountPerAmount || 0) + ((data.qun * data.price) / 100 * data.tax)).toFixed(2)
																	}</td>
																</tr>
															})
														}
													</tbody>
													<tfoot className='w-full'>
														<tr className='font-bold' style={{ background: "#F3F4F6" }}>
															<td colSpan={3} align='right'>TOTAL</td>
															<td>{billDetails.qun}</td>
															<td></td>
															<td><Icons.RUPES className='inline' />{billDetails.discount}</td>
															<td><Icons.RUPES className='inline' />{billDetails.taxAmount}</td>
															<td><Icons.RUPES className='inline' />{billDetails.amount}</td>
														</tr>
														{billData?.roundOffAmount && <tr className='font-semibold' style={{ background: "#F3F4F6" }}>
															<td colSpan={7} align='right' className='italic'>Round Off</td>
															<td><Icons.RUPES className='inline' />
																{
																	billData.roundOffType === "0" ?
																		"-" + billData?.roundOffAmount :
																		billData?.roundOffAmount
																}
															</td>
														</tr>}
														{billData?.roundOffAmount && (
															<tr className='font-semibold' style={{ background: "#F3F4F6" }}>
																<td colSpan={7} align='right'>SUB TOTAL</td>
																<td><Icons.RUPES className='inline' />
																	{
																		billData.roundOffType === "0" ?
																			(Number(billDetails.amount) - Number(billData?.roundOffAmount)) :
																			Number(billDetails.amount) + Number(billData?.roundOffAmount)
																	}
																</td>
															</tr>
														)}
														<tr className='font-semibold' style={{ background: "#F3F4F6" }}>
															<td colSpan={7} align='right'>Received Amount</td>
															<td><Icons.RUPES className='inline' />{billData?.paymentAmount || "0.00"}</td>
														</tr>
														<tr className='font-semibold' style={{ background: "#F3F4F6" }}>
															<td colSpan={7} align='right'>Balance Due</td>
															<td>
																<Icons.RUPES className='inline' />
																{((Number(billData?.finalAmount) - Number(billData?.paymentAmount)) || 0).toFixed(2)}
															</td>
														</tr>
													</tfoot>
												</table>
											</div>

											{/* ===============================[HSN AND TAX TYPES TABLE] ======================== */}
											{/* ================================================================================= */}
											<div className="print-page-break mt-2 ">
												<table className='w-full' style={{ fontSize: '12px' }}>
													<thead className='bg-gray-100'>
														<tr>
															<td>HSN Code</td>
															<td>Taxable Value</td>
															<td>Tax Type</td>
															<td>Rate</td>
															{companyDetails?.state === billData?.party.state && (
																<td>Amount</td>
															)}
															<td align='center'>Total Tax Amount</td>
														</tr>
													</thead>
													<tbody>
														{/* IGST - Inter-state */}
														{hsnData && companyDetails?.state !== billData?.party.state && (() => {
															const rows = [];
															const seen = {};
															console.log(hsnData);


															for (let i = 0; i < hsnData.length; i++) {
																const data = hsnData[i];

																// Skip if we've already seen this HSN
																if (seen[data.hsn]) continue;

																seen[data.hsn] = true;

																const taxableValue = data.price * Number(data.qun);
																const igstAmount = (taxableValue * data.rate / 100).toFixed(2);

																rows.push(
																	<tr key={`${i}-igst`}>
																		<td>{data.hsn}</td>
																		<td>{taxableValue.toFixed(2)}</td>
																		<td>IGST</td>
																		<td>{data.rate}%</td>
																		<td align='center'>{igstAmount}</td>
																	</tr>
																);
															}

															return rows;
														})()}

														{/* SGST/CGST - Intra-state */}
														{hsnData && companyDetails?.state === billData?.party.state && (
															[...new Map(hsnData.map(item => [item.hsn, item])).values()].map((data, i) => {
																const taxableValue = data.price * Number(data.qun);
																const halfRate = data.rate / 2;
																const sgstAmount = (taxableValue * halfRate / 100).toFixed(2);
																const cgstAmount = (taxableValue * halfRate / 100).toFixed(2);
																const totalTax = (Number(sgstAmount) + Number(cgstAmount)).toFixed(2);

																return (
																	<React.Fragment key={`${i}-cgst`}>
																		<tr>
																			<td rowSpan={2}>{data.hsn}</td>
																			<td rowSpan={2}>{taxableValue.toFixed(2)}</td>
																			<td>SGST</td>
																			<td>{halfRate}%</td>
																			<td>{sgstAmount}</td>
																			<td rowSpan={2} align='center'>{totalTax}</td>
																		</tr>
																		<tr>
																			<td>CGST</td>
																			<td>{halfRate}%</td>
																			<td>{cgstAmount}</td>
																		</tr>
																	</React.Fragment>
																);
															})
														)}
													</tbody>
												</table>
											</div>


											<div className='border w-full mt-2'>
												<div className='w-full border-b'>
													<p className='p-1 capitalize' style={{ fontSize: '12px' }}>
														<span className='font-bold '>Total Amount (in words) : </span>
														{/* five hundred and fifty four Rupees .six Paise */}
														{totalAmountInText}
													</p>
												</div>
												<div className='w-full flex border-b'>
													{
														accountDetails && (
															<div className='w-full p-2'>
																<p className='font-bold text-md'>Bank Details</p>
																<div className='w-full flex items-center mt-2' style={{ fontSize: '12px' }}>
																	<div style={{ width: "30%" }}>
																		<p className='font-semibold' style={{ lineHeight: '11px' }}>Name :</p>
																		<p className='font-semibold' style={{ lineHeight: '11px' }}>IFC Code :</p>
																		<p className='font-semibold' style={{ lineHeight: '11px' }}>Account No :</p>
																		<p className='font-semibold' style={{ lineHeight: '11px' }}>Bank Name:</p>
																	</div>
																	<div style={{ width: "70%" }}>
																		<p style={{ lineHeight: '11px' }}>{accountDetails?.accountHolderName}</p>
																		<p style={{ lineHeight: '11px' }}>{accountDetails?.ifscCode}</p>
																		<p style={{ lineHeight: '11px' }}>{accountDetails?.accountNumber}</p>
																		<p style={{ lineHeight: '11px' }}>{accountDetails?.branchName}</p>
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
													<div className='w-full p-2'>
														<p className='font-semibold text-md'>Notes:</p>
														<p className='text-xs text-gray-500'>{billData?.note}</p>
														<br />

														<p className='font-semibold text-md'>Terms & Conditions:</p>
														<p className='text-xs text-gray-500'>{billData?.terms}</p>
													</div>
													<div className='border-l w-full text-center p-2'>
														{
															companyDetails?.signature && (
																<img src={companyDetails?.signature} alt="signature" className='mx-auto' style={{ height: '30px' }} />
															)
														}
														<p className='mt-5' style={{ fontSize: '10px', lineHeight: '0' }}>
															Authorised Signatory For
														</p>
														<p style={{ fontSize: '10px' }}>{companyDetails?.name}</p>
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

export default Invoice
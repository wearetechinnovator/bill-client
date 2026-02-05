import React, { useEffect, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import downloadPdf from '../../helper/downloadPdf';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import { CiViewList } from 'react-icons/ci';
import { Popover, Whisper } from 'rsuite';
import AddNew from '../../components/AddNew';
import { Icons } from '../../helper/icons';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import { Constants } from '../../helper/constants';


const SalesInvoice = () => {
	const toast = useMyToaster();
	const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
	const [activePage, setActivePage] = useState(1);
	const [dataLimit, setDataLimit] = useState(10);
	const [totalData, setTotalData] = useState();
	const [selected, setSelected] = useState([]);
	const navigate = useNavigate();
	const [billData, setBillData] = useState([]);
	const tableRef = useRef(null);
	const [tableStatusData, setTableStatusData] = useState('active');
	const exportData = useMemo(() => {
		return billData && billData.map(({ invoiceDate, salesInvoiceNumber, party, DueDate }) => ({
			"Invoice Date": invoiceDate,
			"Sales Invoice Number": salesInvoiceNumber,
			"Party": party.name,
			"Due Date": DueDate
		}));
	}, [billData]);
	const [loading, setLoading] = useState(true);
	const [summaryToggle, setSummaryToggle] = useState(false);
	const [filterToggle, setFilterToggle] = useState(false);
	const [filterData, setFilterData] = useState({
		productName: "", fromDate: '', toDate: '', billNo: '', party: '',
		gst: "", billDate: ''
	})

	const [ascending, setAscending] = useState(true);
	const [totalSaleAmount, setTotalSaleAmount] = useState(0);
	const [totalPaymentIn, setTotalPaymentIn] = useState(0);
	const [totalDuePayment, setTotalDuePayment] = useState(0);
	const [openConfirm, setOpenConfirm] = useState(false);
	const [selectedTab, setSelectedTab] = useState(Constants.TOTAL_SALE);



	// Get data;
	const getData = async () => {
		try {
			const data = {
				token: Cookies.get("token"),
				trash: tableStatusData === "trash" ? true : false,
				all: tableStatusData === "all" ? true : false
			}
			const url = process.env.REACT_APP_API_URL + `/salesinvoice/get?page=${activePage}&limit=${dataLimit}`;
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": 'application/json'
				},
				body: JSON.stringify(data)
			});
			const res = await req.json();

			if (req.status === 200) {
				// Total Amount
				const totalAmount = res.data.reduce((acc, i) => acc += i.finalAmount, 0);
				setTotalSaleAmount(totalAmount.toFixed(2));

				// Total Unpaid
				const totalPaid = res.data.reduce((acc, i) => {
					if (i.paymentAmount) {
						acc += i.paymentAmount;
					}
					return acc;
				}, 0);
				setTotalPaymentIn(totalPaid.toFixed(2))

				// Total UnPaid
				setTotalDuePayment((totalAmount - totalPaid).toFixed(2))


				if (selectedTab === Constants.PAID) {
					const unpaidInv = res.data.filter(d => d.paymentAmount);
					setBillData(unpaidInv);
				}
				else if (selectedTab === Constants.UNPAID) {
					const paidInv = res.data.filter(d => !d.paymentAmount || d.paymentAmount < d.finalAmount);
					setBillData(paidInv);
				}
				else {
					setTotalData(res.totalData)
					setBillData([...res.data])
				}
			}

		} catch (error) {
			console.log(error)
			return toast("Sales invoice not get", "error");
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		getData();
	}, [tableStatusData, dataLimit, activePage, selectedTab])


	const sortByDate = () => {
		const sorted = [...billData].sort((a, b) => {
			const dateA = new Date(a.invoiceDate);
			const dateB = new Date(b.invoiceDate);
			return ascending ? dateA - dateB : dateB - dateA;
		});
		setBillData(sorted);
		setAscending(!ascending);
	};


	const searchTable = (e) => {
		const value = e.target.value.toLowerCase();
		const rows = document.querySelectorAll('.list__table tbody tr');

		rows.forEach(row => {
			const cols = row.querySelectorAll('td');
			let found = false;
			cols.forEach((col, index) => {
				if (index !== 0 && col.innerHTML.toLowerCase().includes(value)) {
					found = true;
				}
			});
			if (found) {
				row.style.display = "";
			} else {
				row.style.display = "none";
			}
		});
	}


	const selectAll = (e) => {
		if (e.target.checked) {
			setSelected(billData.map(data => data._id));
		} else {
			setSelected([]);
		}
	};


	const handleCheckboxChange = (id) => {
		setSelected((prevSelected) => {
			if (prevSelected.includes(id)) {
				return prevSelected.filter((previd, _) => previd !== id);
			} else {
				return [...prevSelected, id];
			}
		});
	};


	const exportTable = async (whichType) => {
		if (whichType === "copy") {
			copyTable("listQuotation"); // Pass tableid
		}
		else if (whichType === "excel") {
			downloadExcel(exportData, 'Sales-list.xlsx') // Pass data and filename
		}
		else if (whichType === "print") {
			printTable(tableRef, "Sales List"); // Pass table ref and title
		}
		else if (whichType === "pdf") {
			let document = exportPdf('Invoice List', exportData);
			downloadPdf(document)
		}
	}


	const removeData = async (trash) => {
		if (selected.length === 0 || tableStatusData !== 'active') {
			return;
		}
		const url = process.env.REACT_APP_API_URL + "/salesinvoice/delete";
		try {
			const req = await fetch(url, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ ids: selected, trash: trash })
			});
			const res = await req.json();

			if (req.status !== 200 || res.err) {
				return toast(res.err, 'error');
			}

			selected.forEach((id, _) => {
				setBillData((prevData) => {
					return prevData.filter((data, _) => data._id !== id)
				})
			});
			setSelected([]);

			return toast(res.msg, 'success');

		} catch (error) {
			console.log(error)
			toast("Something went wrong", "error")
		}
	}


	const restoreData = async () => {
		if (selected.length === 0 || tableStatusData !== "trash") {
			return;
		}

		const url = process.env.REACT_APP_API_URL + "/salesinvoice/restore";
		try {
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ ids: selected })
			});
			const res = await req.json();

			if (req.status !== 200 || res.err) {
				return toast(res.err, 'error');
			}

			selected.forEach((id, _) => {
				setBillData((prevData) => {
					return prevData.filter((data, _) => data._id !== id)
				})
			});
			setSelected([]);
			return toast(res.msg, 'success');

		} catch (error) {
			console.log(error)
			toast("Something went wrong", "error")
		}
	}


	const getFilterData = async () => {
		if ([
			filterData.billDate, filterData.party, filterData.billNo, filterData.fromDate,
			filterData.toDate, filterData.gst, filterData.productName
		].every((field) => field === "" || !field)) {
			return toast("Choose a filter option", 'error')
		}

		try {
			const url = process.env.REACT_APP_API_URL + `/salesinvoice/filter?page=${activePage}&limit=${dataLimit}`;

			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": 'application/json'
				},
				body: JSON.stringify({ token: Cookies.get("token"), ...filterData })
			});
			const res = await req.json();

			console.log(res)
			setTotalData(res?.totalData)
			setBillData([...res?.data])

		} catch (error) {
			console.log(error)
			return toast("Something went wrong", 'error')
		}
	}


	const clearFilterData = () => {
		getData()
		setFilterData({
			productName: "", fromDate: '', toDate: '', billNo: '', party: '',
			gst: "", billDate: ''
		})
	}


	return (
		<>
			<Nav title={"Sales Invoice"} />
			<main id='main'>
				<SideNav />
				<Tooltip id='salesTooltip' />
				<ConfirmModal
					openConfirm={openConfirm}
					openStatus={(status) => { setOpenConfirm(status) }}
					title={"Are you sure you want to delete the selected invoices?"}
					fun={() => {
						removeData(true);
						setOpenConfirm(false);
					}}
				/>
				<div className='content__body'>
					{/* top section */}
					<div
						className={`add_new_compnent 
								${filterToggle
								? 'h-[270px]' // Highest priority
								: summaryToggle
									? 'h-[150px]' // Second priority
									: 'h-[45px]'  // Default height
							}
						`}>
						<div className='flex justify-between items-center'>
							<div className='flex flex-col'>
								<select value={dataLimit} onChange={(e) => setDataLimit(e.target.value)}>
									<option value={10}>10</option>
									<option value={25}>25</option>
									<option value={50}>50</option>
									<option value={100}>100</option>
								</select>
							</div>
							<div className='listing__btn_grp'>
								<div className='flex w-full flex-col lg:w-[300px]'>
									<input type='text'
										placeholder='Search...'
										onChange={searchTable}
										className='p-[6px]'
									/>
								</div>
								<button
									onClick={() => {
										setSummaryToggle(!summaryToggle)
										setFilterToggle(false)
									}}
									className={`${summaryToggle ? 'bg-gray-200' : 'bg-gray-100'} border`}>
									<CiViewList className='text-xl' />
									Summary
								</button>
								<button
									onClick={() => {
										setFilterToggle(!filterToggle);
										setSummaryToggle(false);
									}}
									className={`${filterToggle ? 'bg-gray-200' : 'bg-gray-100'} border`}>
									<Icons.FILTER className='text-xl' />
									Filter
								</button>
								<button
									onClick={() => {
										if (selected.length === 0 || tableStatusData !== 'active') return;
										setOpenConfirm(true);
									}}
									className={`${selected.length > 0 ? 'bg-red-400 text-white' : 'bg-gray-100'} border`}>
									<Icons.DELETE className='text-lg' />
									Delete
								</button>
								<button
									onClick={() => navigate("/admin/sales-invoice/add")}
									className='bg-[#003E32] text-white '>
									<Icons.ADD className='text-xl text-white' />
									Add New
								</button>
								<div className='flex justify-end'>
									<Whisper placement='leftStart' enterable
										speaker={<Popover full>
											<div className='download__menu' onClick={() => exportTable('print')} >
												<Icons.PRINTER className='text-[16px]' />
												Print Table
											</div>
											<div className='download__menu' onClick={() => exportTable('copy')}>
												<Icons.COPY className='text-[16px]' />
												Copy Table
											</div>
											<div className='download__menu' onClick={() => exportTable('pdf')}>
												<Icons.PDF className="text-[16px]" />
												Download Pdf
											</div>
											<div className='download__menu' onClick={() => exportTable('excel')} >
												<Icons.EXCEL className='text-[16px]' />
												Download Excel
											</div>
										</Popover>}
									>
										<div className='record__download' >
											<Icons.MORE />
										</div>
									</Whisper>
								</div>
							</div>
						</div>

						{
							summaryToggle && <div id='summaryToggle'>
								<hr />
								<table className='w-full'>
									<tr className='text-center'>
										<td>Total Transactions</td>
										<td>Total CGST</td>
										<td>Total SGST</td>
										<td>Total Taxable</td>
										<td>Total Value</td>
									</tr>
									<tr className='text-center'>
										<td className='pt-4 font-bold'>1</td>
										<td className='font-bold'>Rs. 0.00</td>
										<td className='font-bold'>Rs. 0.00</td>
										<td className='font-bold'>Rs. 0.00</td>
										<td className='font-bold'>Rs. 4,500.00</td>
									</tr>
								</table>
							</div>
						}

						{
							filterToggle && (
								<div id='filterToggle'>
									<hr />
									<div
										className='grid gap-4 lg:grid-cols-4 sm:grid-cols-2 grid-cols-1'
										id='filterBill'
									>
										<div>
											<p>Product Name</p>
											<input type="text"
												value={filterData.productName}
												onChange={(e) => setFilterData({ ...filterData, productName: e.target.value })}
											/>
										</div>
										<div>
											<p>Bill No</p>
											<input type="text"
												value={filterData.billNo}
												onChange={(e) => setFilterData({ ...filterData, billNo: e.target.value })}
											/>
										</div>
										<div>
											<p>From Date</p>
											<input type="date"
												value={filterData.fromDate}
												onChange={(e) => setFilterData({ ...filterData, fromDate: e.target.value })}
											/>
										</div>
										<div>
											<p>To Date</p>
											<input type="date"
												value={filterData.toDate}
												onChange={(e) => setFilterData({ ...filterData, toDate: e.target.value })}
											/>
										</div>
										<div>
											<p>Party</p>
											<input type="text"
												value={filterData.party}
												onChange={(e) => setFilterData({ ...filterData, party: e.target.value })}
											/>
										</div>
										<div>
											<p>GSTIN</p>
											<input type="text"
												value={filterData.gst}
												onChange={(e) => setFilterData({ ...filterData, gst: e.target.value })}
											/>
										</div>
									</div>

									<div className='w-full flex justify-end gap-2 mt-5' id='filterBtnGrp'>
										<button onClick={getFilterData}>
											<Icons.SEARCH />
											Search
										</button>
										<button onClick={clearFilterData}>
											<Icons.RESET />
											Reset
										</button>
									</div>
								</div>
							)
						}
					</div>
					{
						!loading ? billData.length > 0 ? <div className='content__body__main'>
							<div className='flex flex-col md:flex-row justify-between items-center mb-5 gap-8'>
								<div
									onClick={() => setSelectedTab(Constants.TOTAL_SALE)}
									className={`party__data ${selectedTab === Constants.TOTAL_SALE ? 'active' : ''}`}
								>
									<h6><Icons.INVOICE /> Total Sale</h6>
									<p><Icons.RUPES />{totalSaleAmount}</p>
								</div>
								<div
									onClick={() => setSelectedTab(Constants.PAID)}
									className={`party__data ${selectedTab === Constants.PAID ? 'active' : ''}`}
								>
									<h6><Icons.TREDING_UP />Paid</h6>
									<p><Icons.RUPES />{totalPaymentIn}</p>
								</div>
								<div
									onClick={() => setSelectedTab(Constants.UNPAID)}
									className={`party__data ${selectedTab === Constants.UNPAID ? 'active' : ''}`}
								>
									<h6><Icons.TREDING_DOWN />Unpaid</h6>
									<p><Icons.RUPES /> {totalDuePayment} </p>
								</div>
							</div>
							{/* Table start */}
							<div className='overflow-x-auto list__table'>
								<table className='min-w-full bg-white' id='listQuotation' ref={tableRef}>
									<thead className='list__table__head'>
										<tr>
											<th className='py-2 border-b' align='center'>
												<input type='checkbox'
													onChange={selectAll}
													checked={billData.length > 0 && selected.length === billData.length}
												/>
											</th>
											<th className='py-2 border-b cursor-pointer' align='left'>
												<div className='flex items-center justify-start' onClick={sortByDate}>
													Date {ascending ? <Icons.DROPDOWN /> : <Icons.DROPUP />}
												</div>
											</th>
											<th className='py-2 border-b' align='left'>Sales Invoice Number</th>
											<th className='py-2 border-b' align='left'>Party Name</th>
											<th className='py-2 border-b' align='left'>Due Date</th>
											<th className='py-2 border-b' align='left'>Status</th>
											<th className='py-2 border-b' align='left'>Amount</th>
											<th className='py-2 border-b'>Action</th>
										</tr>
									</thead>
									<tbody>
										{
											billData.map((data, i) => {
												let paymentStatus = Constants.UNPAID;
												const paymentAmount = Number(data.paymentAmount) || 0;

												if (data.finalAmount === paymentAmount) {
													paymentStatus = Constants.PAID;
												}
												else if (paymentAmount > 0 && paymentAmount < data.finalAmount) {
													paymentStatus = Constants.PARTIAL_PAID;
												}


												return <tr key={i}
													onClick={() => navigate(`/admin/bill/details/salesinvoice/${data._id}`)}>
													<td className='py-2 max-w-[10px]' align='center'>
														<input type='checkbox'
															checked={selected.includes(data._id)}
															onChange={() => handleCheckboxChange(data._id)}
															onClick={(e) => e.stopPropagation()}
														/>
													</td>
													<td align='left'>{new Date(data.invoiceDate).toLocaleDateString()}</td>
													<td>{data.salesInvoiceNumber}</td>
													<td align='left'>{data.party.name}</td>
													<td align='left'>
														{data.DueDate ? new Date(data.DueDate).toLocaleDateString() : "--"}
													</td>
													<td align='left'>
														<span className={`${paymentStatus === Constants.PAID ? 'green-badge' : paymentStatus === Constants.PARTIAL_PAID ? 'yellow-badge' : 'red-badge'} badge capitalize`}>
															{paymentStatus}
														</span>
													</td>
													<td align='left'>
														<Icons.RUPES className='inline' /> {data.finalAmount}
														{
															paymentStatus !== Constants.PAID && (
																<p className='text-[12px] py-1'>
																	<Icons.RUPES className='inline text-[10px]' />
																	{data.finalAmount - paymentAmount} unpaid
																</p>
															)
														}
													</td>
													<td className='text-center'>
														<Whisper
															placement='leftStart'
															trigger={"click"}
															speaker={<Popover full>
																<div
																	className='table__list__action__icon'
																	onClick={(e) => {
																		e.stopPropagation();
																		navigate(`/admin/sales-invoice/edit/${data._id}`)
																	}}
																>
																	<Icons.EDIT className='text-[16px]' />
																	Edit
																</div>
																<div
																	className='table__list__action__icon'
																	onClick={(e) => {
																		e.stopPropagation();
																		navigate(`/admin/bill/details/salesinvoice/${data._id}`)
																	}}
																>
																	<Icons.INFO_DETAILS className='text-[16px]' />
																	Details
																</div>
															</Popover>}
														>
															<div className='table__list__action' onClick={(e) => e.stopPropagation()}>
																<Icons.HORIZONTAL_MORE />
															</div>
														</Whisper>
													</td>
												</tr>
											})
										}
									</tbody>
								</table>
								<div className='paginate__parent'>
									<p>Showing {billData.length} of {totalData} entries</p>
									{/* ----- Paginatin ----- */}
									<Pagination
										activePage={activePage}
										totalData={totalData}
										dataLimit={dataLimit}
										setActivePage={setActivePage}
									/>
								</div>
								{/* pagination end */}
							</div>
						</div>
							: <AddNew title={"Sales Invoice"} link={"/admin/sales-invoice/add"} />
							: <DataShimmer />
					}
				</div>
			</main>

		</>
	)
}

export default SalesInvoice;


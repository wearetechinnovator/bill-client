import { useEffect, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Modal, Popover, Whisper } from 'rsuite';
import { BiPrinter } from "react-icons/bi";
import { FaRegCopy, FaRegEdit } from "react-icons/fa";
import { FaRegFilePdf } from "react-icons/fa";
import { FaRegFileExcel } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import downloadPdf from '../../helper/downloadPdf';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import { IoIosAdd, IoMdMore } from 'react-icons/io';
import AddNew from '../../components/AddNew';
import { FiMoreHorizontal } from 'react-icons/fi';
import ConfirmModal from '../../components/ConfirmModal';
import Pagination from '../../components/Pagination';
import { Icons } from '../../helper/icons';
import ContextMenu from '../../components/ContextMenu';
import EnquiryLogCard from '../../components/EnquiryLogCard';
import useTopLoading from '../../hooks/useTopLoadingBar';





const Enquiry = () => {
	const token = Cookies.get("token");
	const toast = useMyToaster();
	const { TopLoadingBar, setTopLoading } = useTopLoading();
	const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
	const [activePage, setActivePage] = useState(1);
	const [dataLimit, setDataLimit] = useState(10);
	const [totalData, setTotalData] = useState();
	const [selected, setSelected] = useState([]);
	const navigate = useNavigate();
	const [enquiryData, setEnquiryData] = useState([]);
	const tableRef = useRef(null);
	const [tableStatusData, setTableStatusData] = useState('active');
	const exportData = useMemo(() => {
		return enquiryData && enquiryData.map((e) => ({
			"Enq No.": e.enqNo,
			"Party": e.party.name,
			"Contact person": e.contactPerson.name,
			"Received Date": e.dateReceived?.split("T")[0]
		}));
	}, [enquiryData]);
	const [loading, setLoading] = useState(true);
	const [openConfirm, setOpenConfirm] = useState(false);
	const [searchText, setSearchText] = useState("");
	let debounceRef = useRef(null);
	const [openEnquiryModal, setOpenEnquiryModal] = useState(false)
	const [enquiryModalData, setEnquiryModalData] = useState({});
	const [allQuotations, setAllQuotations] = useState([]); //Enquiry wise Quotation;
	const [allPO, setAllPO] = useState([]); //Enquiry wise PO;
	const [salesUser, setSalesUser] = useState([]);
	const [enquiryActiveTab, setEnquiryActiveTab] = useState('details');
	const [billLogs, setBillLogs] = useState([]);
	const [lastAction, setLastAction] = useState([]);
	const [currentEnquiryData, setCurrentEnquiryData] = useState(null) //for Modal LOGS;




	// Get data;
	useEffect(() => {
		(async () => {
			try {
				const data = {
					token,
					all: tableStatusData === "all" ? true : false,
					searchText: searchText
				}
				setTopLoading(25);
				const URL = `${process.env.REACT_APP_API_URL}/enquiry/get-all?page=${activePage}&limit=${dataLimit}`;
				const req = await fetch(URL, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify(data)
				});
				setTopLoading(50);
				const res = await req.json();
				setTopLoading(75);

				setTotalData(res.totalData)
				setEnquiryData([...res.data]);
				setTopLoading(100);

			} catch (error) {
				setTopLoading(0);
				return toast("Something went wrong, Data not fetch", "error");
			} finally {
				setLoading(false);
			}
		})()
	}, [tableStatusData, dataLimit, activePage, searchText]);

	// Get Invoice LOGS from Modal;
	useEffect(() => {
		if (!openEnquiryModal) return;
		(async () => {
			try {
				const URL = `${process.env.REACT_APP_API_URL}/enquiry/get-log`;
				const req = await fetch(URL, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ token, enqNo: enquiryModalData.enqNo })
				});
				const res = await req.json();
				if (req.status !== 200) {
					return toast(res.err, 'error');
				}
				console.log(res);
				setBillLogs(res.bills);

			} catch (err) {
				return toast("Something went wrong", "error");
			}
		})()
	}, [openEnquiryModal]);


	useEffect(() => {
		if (!openEnquiryModal) return;
		(async () => {
			try {
				const URL = `${process.env.REACT_APP_API_URL}/enquiry/get-quotation-po`;
				const req = await fetch(URL, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ token, enqNo: enquiryModalData.enqNo })
				});
				const res = await req.json();
				if (req.status !== 200) {
					return toast(res.err, 'error');
				}
				setAllQuotations(res.quo);
				setAllPO(res.po)

			} catch (err) {
				return toast("Something went wrong", "error");
			}
		})()
	}, [openEnquiryModal])


	// Get Enquiry wise last action;
	useEffect(() => {
		(async () => {
			try {
				const URL = `${process.env.REACT_APP_API_URL}/enquiry/get-last-action`;
				const req = await fetch(URL, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ token, enqNo: enquiryModalData.enqNo })
				});
				const res = await req.json();
				if (req.status !== 200) {
					return toast(res.err, 'error');
				}

				console.log(res);
				setLastAction(res.result);

			} catch (err) {
				return toast("Something went wrong", "error");
			}
		})()
	}, [])


	// Get all User and store only sales
	useEffect(() => {
		(async () => {
			try {
				const URL = `${process.env.REACT_APP_API_URL}/user/get-all`;
				const req = await fetch(URL, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ token })
				});
				const res = await req.json();
				if (req.status !== 200) {
					return toast(res.err, "error");
				}

				// Filter sales person only
				const salesPerson = res.filter(s => s.role === "sales");
				setSalesUser(salesPerson);
			} catch (err) {
				return toast("Something went wrong!", 'error')
			}
		})()
	}, [])

	const selectAll = (e) => {
		if (e.target.checked) {
			setSelected(enquiryData.map(data => {
				if (data.isConverted) {
					return null;
				}
				return data._id;
			}));
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
			downloadExcel(exportData, 'enquiry.xlsx') // Pass data and filename
		}
		else if (whichType === "print") {
			printTable(tableRef, "Enquiry"); // Pass table ref and title
		}
		else if (whichType === "pdf") {
			let document = exportPdf('Enquiry', exportData);
			downloadPdf(document)
		}
	}

	const removeData = async () => {
		if (selected.length === 0 || tableStatusData !== 'active') {
			return;
		}
		const url = process.env.REACT_APP_API_URL + "/enquiry/delete";
		try {
			const req = await fetch(url, {
				method: "DELETE",
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
				setEnquiryData((prevData) => {
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


	return (
		<>

			<Nav title={"Enquiry Track"} />
			<main id='main'>
				<SideNav />
				<Tooltip id='accoutnTooltip' />
				<ConfirmModal
					openConfirm={openConfirm}
					openStatus={(status) => { setOpenConfirm(status) }}
					title={"Are you sure you want to delete the selected Accounts?"}
					fun={() => {
						removeData();
						setOpenConfirm(false);
					}}
				/>
				<ContextMenu
					print={() => exportTable('print')}
					copy={() => exportTable('copy')}
					pdf={() => exportTable('pdf')}
					excel={() => exportTable('excel')}
				/>
				<div className='content__body'>
					<div className={`add_new_compnent`}>
						<div className='flex justify-between items-center'>
							<div className='flex flex-col'>
								<select value={dataLimit} onChange={(e) => setDataLimit(e.target.value)}>
									<option value={10}>10</option>
									<option value={25}>25</option>
									<option value={50}>50</option>
									<option value={100}>100</option>
								</select>
							</div>
							<div className='flex items-center gap-2'>
								<button
									onClick={() => {
										if (selected.length === 0 || tableStatusData !== 'active') return;
										setOpenConfirm(true);
									}}
									className={`${selected.length > 0 ? 'bg-red-400 text-white' : 'bg-gray-100'} border`}>
									<Icons.DELETE size={15} />
									Delete
								</button>
								<button
									onClick={() => navigate("/admin/enquiry/add")}
									className='bg-[#003E32] text-white '>
									<Icons.ADD_CIRCLE size={15} className='text-white' />
									Add New
								</button>
								{
									enquiryData?.length > 0 && (
										<div className='flex justify-end'>
											<Whisper placement='leftStart' enterable
												speaker={<Popover full>
													<div className='download__menu' onClick={() => exportTable('print')} >
														<BiPrinter className='text-[16px]' />
														Print Table
													</div>
													<div className='download__menu' onClick={() => exportTable('copy')}>
														<FaRegCopy className='text-[16px]' />
														Copy Table
													</div>
													<div className='download__menu' onClick={() => exportTable('pdf')}>
														<FaRegFilePdf className="text-[16px]" />
														Download Pdf
													</div>
													<div className='download__menu' onClick={() => exportTable('excel')} >
														<FaRegFileExcel className='text-[16px]' />
														Download Excel
													</div>
												</Popover>}
											>
												<div className='record__download' >
													<IoMdMore />
												</div>
											</Whisper>
										</div>
									)
								}

							</div>
						</div>
					</div>

					{
						!loading ? (
							enquiryData.length > 0 ? (
								<>
									<div className='content__body__main view'>
										{/* Table start */}
										<div className='overflow-x-auto list__table'>
											<table className='min-w-full bg-white' id='listQuotation' ref={tableRef}>
												<thead className='list__table__head'>
													<tr>
														<th className='py-2 px-4 border-b'>
															<input type='checkbox'
																onChange={selectAll}
																checked={enquiryData.length > 0 && selected.length === enquiryData.length}
															/>
														</th>
														<th align='left' className='w-[70px]'>ENQ No.</th>
														<th align='left' className='w-[110px]'>Date Received</th>
														<th align='left'>Party</th>
														<th align='left'>City</th>
														<th align='left'>Assign To</th>
														<th align='left'>Contact Person</th>
														<th align='left' className='w-[160px]'>Last Action Taken</th>
														<th align='left' className='w-[70px]'>Status</th>
														<th>Items</th>
														<th>Action</th>
													</tr>
												</thead>
												<tbody>
													{
														enquiryData.map((data, i) => {
															const action = lastAction?.find(a => a.enqNo === data.enqNo);

															return <tr key={i} onClick={(e) => {
																setEnquiryModalData(data);
																setOpenEnquiryModal(true);
																setCurrentEnquiryData(data);
															}} className='cursor-pointer'>
																<td className='py-2' align='center'>
																	<input type='checkbox'
																		checked={selected.includes(data._id)}
																		onClick={(e) => e.preventDefault()}
																		onChange={() => handleCheckboxChange(data._id)}
																		disabled={data.isConverted}
																	/>
																</td>
																<td align='left'>{data.enqNo}</td>
																<td align='left'>{data.dateReceived?.split("T")[0] || "-"}</td>
																<td align='left'>{data.party.name}</td>
																<td align='left'>{data.party.city || '--'}</td>
																<td align='left'>
																	{
																		salesUser.filter(s => {
																			return s.parties.includes(data.party._id)
																		}).map(u => {
																			return <span className='badge indigo-badge ml-1 px-1'>{u.name}</span>
																		})
																	}
																</td>
																<td align='left'>
																	{data.contactPerson.name} |
																	<span className='font-bold text-xs mx-1'>T:</span>
																	<span className='text-[10px] text-gray-600 ml-1'>{data.contactPerson.phone}</span>
																</td>
																<td align='left'>
																	{
																		action?.lastAction ? (
																			<>
																				<span className='badge green-badge'>
																					Convert to <span className='uppercase'>{action?.lastAction}</span>
																				</span>
																				{/* <span className='text-[10px] border bg-gray-100 px-1 rounded ml-1'>
																					{action?.lastActionDate.split("T")[0]}
																				</span> */}
																			</>
																		) : (
																			<span className='badge yellow-badge capitalize'>Enquiry Registerd</span>
																		)
																	}

																</td>
																<td align='left'>
																	{
																		data.enquiryStatus && (
																			data.enquiryStatus === "close" ? (
																				<span className='badge red-badge'>
																					{data.enquiryStatus?.toUpperCase() || "-"}
																				</span>
																			) : data.enquiryStatus === "open" ? (
																				<span className='badge green-badge'>
																					{data.enquiryStatus?.toUpperCase() || "-"}
																				</span>
																			) : data.enquiryStatus === "followup" ? (
																				<span className='badge indigo-badge'>
																					{data.enquiryStatus?.toUpperCase() || "-"}
																				</span>
																			) : (
																				<span className='badge green-badge'>
																					{data.enquiryStatus?.toUpperCase() || "-"}
																				</span>
																			)

																		)
																	}

																</td>
																<td>
																	<Whisper
																		placement='leftStart'
																		trigger={"hover"}
																		speaker={<Popover full>
																			{
																				data.items.map((d, i) => {
																					return <div key={i} className='p-1 px-3 border-b last:border-0'>
																						<div><strong>Item:</strong> {d.item.title}</div>
																						<div><strong>Qty:</strong> {d.qty}</div>
																					</div>
																				})
																			}
																		</Popover>}
																	>
																		<div className='table__list__action' >
																			<Icons.INFO_DETAILS />
																		</div>
																	</Whisper>
																</td>
																<td>
																	<Whisper
																		placement='leftStart'
																		trigger={"click"}
																		speaker={<Popover full>
																			{
																				!data.isConverted && (
																					<div
																						className='table__list__action__icon'
																						onClick={() => navigate(`/admin/enquiry/edit/${data._id}`)}
																					>
																						<FaRegEdit className='text-[16px]' />
																						Edit
																					</div>
																				)
																			}

																			<div
																				className='table__list__action__icon'
																				onClick={() => navigate(`/admin/quotation-estimate/add`, {
																					state: { ...data }
																				})}
																			>
																				<Icons.CONVERT className='text-[16px]' />
																				Convert to Quotation
																			</div>
																		</Popover>}
																	>
																		<div className='table__list__action' onClick={(e) => {
																			e.stopPropagation();
																		}}>
																			<FiMoreHorizontal />
																		</div>
																	</Whisper>
																</td>
															</tr>
														})
													}
												</tbody>
											</table>
											<p className='pt-2'>Showing {enquiryData.length} of {totalData} entries</p>
											<Pagination
												activePage={activePage}
												totalData={totalData}
												dataLimit={dataLimit}
												setActivePage={setActivePage}
											/>
										</div>
									</div>
								</>
							) : <AddNew title={"Enquiry Track"} link={"/admin/enquiry/add"} />
						) : <DataShimmer />
					}
				</div>
			</main>

			{/* Enquiry Details Modal */}
			<Modal open={openEnquiryModal} size={'xs'} onClose={() => setOpenEnquiryModal(false)}>
				<Modal.Header>
					<Modal.Title></Modal.Title>
					<p className='font-bold'>Enquiry Info</p>
				</Modal.Header>
				<div className='w-full flex items-center mt-1.5 bg-gray-100 enquiry__tab'>
					<button
						onClick={() => setEnquiryActiveTab('details')}
						className={`${enquiryActiveTab === 'details' && 'active'}`}>
						Details
					</button>
					<button
						onClick={() => setEnquiryActiveTab('log')}
						className={`${enquiryActiveTab === 'log' && 'active'}`}>
						Logs
					</button>
				</div>
				<Modal.Body className='enquiry__modal'>
					{
						enquiryActiveTab === 'details' && (
							<>
								<table className={`enquiry__modal__view `}>
									<tbody>
										<tr>
											<td width={'35%'} className='pt-3 font-[650]'>Enquiry NO.</td>
											<td width={'65%'}>{enquiryModalData.enqNo}</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Received Date</td>
											<td>{enquiryModalData.dateReceived?.split("T")[0]}</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Enquiry Source</td>
											<td className='capitalize'>{enquiryModalData.enquirySource}</td>
										</tr>
										{
											enquiryModalData.enquirySource === "others" && (
												<tr>
													<td className='pt-3 font-[650]'>Others Source</td>
													<td className='capitalize'>{enquiryModalData.otherSource}</td>
												</tr>
											)
										}
										<tr>
											<td className='pt-3 font-[650]'>City</td>
											<td>{enquiryModalData.party?.city || "-"}</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Contact Person</td>
											<td>{enquiryModalData.contactPerson?.name || "-"}</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Designation</td>
											<td>{enquiryModalData.contactPerson?.designation || "-"}</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Mobile Number</td>
											<td>{enquiryModalData.contactPerson?.phone || "-"}</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Email Id</td>
											<td>{enquiryModalData.contactPerson?.email || "-"}</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Industry</td>
											<td>{enquiryModalData.industry || "-"}</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Enquiry Status</td>
											<td>{enquiryModalData.enquiryStatus || "-"}</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Follow Up</td>
											<td>{enquiryModalData.followUp?.toUpperCase() || "-"}</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Follow Up Date</td>
											<td>{enquiryModalData.followUpDate?.split("T")[0] || "-"}</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Order Probablity (%)</td>
											<td>{enquiryModalData.orderProbality || "-"}</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Expected Order Date</td>
											<td>{enquiryModalData.expectedOrderDate?.split("T")[0] || "-"}</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Remark</td>
											<td>
												<p className='max-w-[80%]'>{enquiryModalData.message || "-"}</p>
											</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>Quotation Number</td>
											<td>
												{
													allQuotations?.map(q => {
														return (
															<span className='badge indigo-badge mr-1'>
																{q.quotationNumber}
															</span>
														)
													})
												}
											</td>
										</tr>
										<tr>
											<td className='pt-3 font-[650]'>PO Number</td>
											<td>
												{
													allPO.map(q => {
														return (
															<span className='badge yellow-badge mr-1'>
																{q.poNumber}
															</span>
														)
													})
												}
											</td>
										</tr>
									</tbody>
								</table>

								<p className='font-bold mt-4'>Enquiry Item Details</p>
								<table className='enquiry__modal__view mt-2'>
									<tbody>
										{
											enquiryModalData.items?.map((data, i) => {
												return <tr key={i}>
													<td className='font-[650]'>{data.item?.title || "-"}</td>
													<td className='font-[650]'>{data.qty || "-"}</td>
												</tr>
											})
										}
									</tbody>
								</table>
							</>
						)
					}
					{
						enquiryActiveTab === 'log' && (
							<>
								{/* =======================[Enquiry Registerd]================== */}
								{/* ============================================================ */}
								<EnquiryLogCard
									date={`Date :${currentEnquiryData?.createdAt.split("T")[0]}`}
									enqNo={`ENQ Registerd #${currentEnquiryData?.enqNo}`}
									items={currentEnquiryData?.items}
									className={'pt-2'}
								/>
								<EnquiryLogCard
									date={`Date :${currentEnquiryData?.dateReceived?.split("T")[0] || ''}`}
									enqNo={`ENQ Received #${currentEnquiryData?.enqNo}`}
									items={currentEnquiryData?.items}
								/>

								{
									billLogs.map((b, i) => {
										return <div className={`w-full flex gap-2 pr-2 bg-gray-50`} key={b._id}>
											<div className='flex flex-col justify-center items-center'>
												<div className='w-[14px] h-[16px] bg-[#003E32] rounded-full'></div>
												<div className={`w-[1px] h-full bg-[#003E32]`}></div>
												{/* ${i === (billLogs.length - 1) && 'invisible'} */}
											</div>
											<div className='w-full'>
												<div className='rounded-md w-full hover:border-gray-400 bg-white shadow'>
													<div className='w-full flex items-center justify-between p-2'>
														<div className='w-full flex items-center gap-1.5'>
															<span className='badge green-badge uppercase'>
																{b.type} #{b.invoiceNumber}
															</span>
															<span className='badge indigo-badge'>
																<Icons.CALENDAR className='inline mr-[2px] mt-[-2px]' />
																Date : {b.date?.split("T")[0]}
															</span>
														</div>
														<div className='flex items-end gap-1'>

														</div>
													</div>
													<table className='w-full p-3 text-xs'>
														<thead>
															<tr>
																<td className='px-2 py-0 font-bold text-[11px]'>Items</td>
																<td className='font-bold text-[11px]'>QTY</td>
															</tr>
														</thead>
														<tbody className='lowercase'>
															{
																b.items.map((item, i) => {
																	return (
																		<tr className={`${i !== (b.items.length - 1) ? 'border-b border-dashed border-gray-200' : ''}`} key={item.itemId}>
																			<td className='px-2 py-1.5'>{item.itemName}</td>
																			<td>
																				{b.type === "po" ? item.invoice_qun : item.qun}
																			</td>
																		</tr>
																	)
																})
															}
														</tbody>
													</table>
												</div>
												<div className='h-[15px]'></div>
											</div>
										</div>
									})
								}
							</>
						)
					}
				</Modal.Body>
			</Modal>
			{TopLoadingBar}
		</>
	)
}

export default Enquiry;


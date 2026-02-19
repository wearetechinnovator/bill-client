import { useEffect, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Popover, Whisper } from 'rsuite';
import { BiPrinter } from "react-icons/bi";
import { FaRegCopy, FaRegEdit } from "react-icons/fa";
import { FaRegFilePdf } from "react-icons/fa";
import { FaRegFileExcel } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
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




const Account = () => {
	const token = Cookies.get("token")
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
		return billData && billData.map(({ title, type, openingBalance }) => ({
			"Title": title,
			"Type": type,
			"Balance": openingBalance
		}));
	}, [billData]);
	const [loading, setLoading] = useState(true);
	const [openConfirm, setOpenConfirm] = useState(false);
	const [balanceAmount, setBalanceAmount] = useState({});




	// Get Balance
	useEffect(() => {
		(async () => {
			try {
				const url = process.env.REACT_APP_API_URL + `/account/get-balance`;
				const req = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ token })
				});
				const res = await req.json();
				setBalanceAmount(res);

			} catch (error) {
				return toast("Balance not get", "error");
			}
		})()
	}, [])


	// Get data;
	useEffect(() => {
		const getData = async () => {
			try {
				const data = {
					token: Cookies.get("token"),
					trash: tableStatusData === "trash" ? true : false,
					all: tableStatusData === "all" ? true : false
				}
				const url = process.env.REACT_APP_API_URL + `/account/get?page=${activePage}&limit=${dataLimit}`;
				const req = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify(data)
				});
				const res = await req.json();
				setTotalData(res.totalData)
				setBillData([...res.data]);

			} catch (error) {
				console.log(error)
			} finally {
				setLoading(false);
			}
		}
		getData();
	}, [tableStatusData, dataLimit, activePage])


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
			downloadExcel(exportData, 'account.xlsx') // Pass data and filename
		}
		else if (whichType === "print") {
			printTable(tableRef, "Account"); // Pass table ref and title
		}
		else if (whichType === "pdf") {
			let document = exportPdf('Account', exportData);
			downloadPdf(document)
		}
	}


	const removeData = async (trash) => {
		if (selected.length === 0 || tableStatusData !== 'active') {
			return;
		}
		const url = process.env.REACT_APP_API_URL + "/account/delete";
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
				setBillData((prevData) => {
					return prevData.filter((data, _) => data._id !== id)
				})
			});
			setSelected([]);

			return toast(res.msg, 'success');

		} catch (error) {
			toast("Something went wrong", "error")
		}
	}


	const restoreData = async () => {
		if (selected.length === 0 || tableStatusData !== "trash") {
			return;
		}

		const url = process.env.REACT_APP_API_URL + "/account/restore";
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



	return (
		<>
			<Nav title={"Account"} />
			<main id='main'>
				<SideNav />
				<Tooltip id='accoutnTooltip' />
				<ConfirmModal
					openConfirm={openConfirm}
					openStatus={(status) => { setOpenConfirm(status) }}
					title={"Are you sure you want to delete the selected Accounts?"}
					fun={() => {
						removeData(true);
						setOpenConfirm(false);
					}}
				/>
				<div className='content__body'>
					<div
						className={`mb-5 w-full bg-white rounded p-4 shadow-sm add_new_compnent overflow-hidden
						transition-all
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
							<div className='flex items-center gap-2'>
								<div className='flex w-full flex-col lg:w-[300px]'>
									<input type='text'
										placeholder='Search...'
										onChange={searchTable}
										className='p-[6px]'
									/>
								</div>
								<button
									onClick={() => {
										if (selected.length === 0 || tableStatusData !== 'active') return;
										setOpenConfirm(true);
									}}
									className={`${selected.length > 0 ? 'bg-red-400 text-white' : 'bg-gray-100'} border`}>
									<MdDeleteOutline className='text-lg' />
									Delete
								</button>
								<button
									onClick={() => navigate("/admin/account/add")}
									className='bg-[#003E32] text-white '>
									<IoIosAdd className='text-xl text-white' />
									Add New
								</button>
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
							</div>
						</div>
					</div>

					{
						!loading ? billData.length > 0 ? <div className='content__body__main'>
							{/* Table start */}
							<div className='overflow-x-auto list__table'>
								<table className='min-w-full bg-white' id='listQuotation' ref={tableRef}>
									<thead className='list__table__head'>
										<tr>
											<th className='py-2 px-4 border-b'>
												<input type='checkbox'
													onChange={selectAll}
													checked={billData.length > 0 && selected.length === billData.length}
												/>
											</th>
											<th align='left'>Account Name</th>
											<th align='left'>Account Holder</th>
											<th align='left'>Balance</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td className='py-2' align='center'>#</td>
											<td>Cash</td>
											<td>Cash Account</td>
											<td>
												<Icons.RUPES className='inline' />
												{Number(balanceAmount?.cash).toFixed(2)}
											</td>
										</tr>
										{
											billData.map((data, i) => {
												return <tr key={i}>
													<td className='py-2' align='center'>
														<input type='checkbox'
															checked={selected.includes(data._id)}
															onChange={() => handleCheckboxChange(data._id)}
														/>
													</td>
													<td align='left'>{data.accountName}</td>
													<td align='left'>{data.accountHolderName || '--'}</td>
													<td align='left'>
														<Icons.RUPES className='inline' />
														{Number(balanceAmount?.[data._id]).toFixed(2)}
													</td>
													<td>
														<Whisper
															placement='leftStart'
															trigger={"click"}
															speaker={<Popover full>
																<div
																	className='table__list__action__icon'
																	onClick={() => navigate(`/admin/account/edit/${data._id}`)}
																>
																	<FaRegEdit className='text-[16px]' />
																	Edit
																</div>
															</Popover>}
														>
															<div className='table__list__action' >
																<FiMoreHorizontal />
															</div>
														</Whisper>
													</td>
												</tr>
											})
										}
									</tbody>
								</table>
								<p className='py-4'>Showing {billData.length} of {totalData} entries</p>
								<Pagination
									activePage={activePage}
									totalData={totalData}
									dataLimit={dataLimit}
									setActivePage={setActivePage}
								/>
								{/* pagination end */}
							</div>
						</div>
							: <AddNew title={"Account"} link={"/admin/account/add"} />
							: <DataShimmer />
					}
				</div>
			</main>

		</>
	)
}

export default Account;


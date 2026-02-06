import { useEffect, useState } from 'react'
import Nav from '../../components/Nav'
import SideNav from '../../components/SideNav'
import { SelectPicker } from 'rsuite'
import useApi from '../../hooks/useApi'
import useMyToaster from '../../hooks/useMyToaster'
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom'
import MySelect2 from '../../components/MySelect2'
import { Icons } from '../../helper/icons'
import { Constants } from '../../helper/constants'



// --- PAYMENT IN ---
const AddPayment = ({ mode }) => {
	const token = Cookies.get("token");
	const navigate = useNavigate();
	const { getApiData } = useApi();
	const toast = useMyToaster();
	const { id } = useParams();
	const currentDate = new Date().toISOString().split("T")[0]
	const [formData, setFormData] = useState({
		party: "", paymentInNumber: "", paymentInDate: currentDate, paymentMode: Constants.CASH,
		account: "", amount: "", details: "", invoiceId: ''
	})
	const [dueAmount, setDueAmount] = useState(null);

	// Store party
	const [party, setParty] = useState([]);
	// Store account
	const [account, setAccount] = useState([]);
	// Store invoice number
	const [invoice, setInvoice] = useState([]);
	// invoice data
	const [invoiceData, setInvoiceData] = useState([]);
	let [checkedInv, setCheckedInv] = useState([]);
	let [tempAmount, setTempAmount] = useState(0);



	useEffect(() => {
		if (formData.amount) {
			let totalSelected = 0;
			for (const item of checkedInv) {
				totalSelected += item.finalAmount - (item.paymentAmount || 0);
			}
			// const remaining = parseInt(formData.amount, 10) - totalSelected;

			setTempAmount(totalSelected);
		}
	}, [formData.amount, checkedInv]);




	// Get invoice
	useEffect(() => {
		const getInvoice = async () => {
			try {
				const url = process.env.REACT_APP_API_URL + "/salesinvoice/get";

				const req = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ token, invoice: true, party: formData.party })
				})
				const res = await req.json();
				const inv = res.data.map((inv) => ({
					value: inv.salesInvoiceNumber, label: inv.salesInvoiceNumber,
					due: inv.dueAmount
				}));

				setInvoiceData([...res.data]);
				setInvoice([...inv])

			} catch (error) {
				console.log(error);
				return toast("Something went wrong", "error");
			}
		}

		getInvoice();

	}, [formData.party])


	// Get data for update mode
	useEffect(() => {
		if (mode) {
			const get = async () => {
				const res = await getApiData("paymentin", id);
				console.log(res)
				setFormData({
					...formData, ...res.data,
					paymentInDate: res.data.paymentInDate.split("T")[0]
				});
			}

			get();
		}
	}, [mode])


	// Get Pary and Account, Account dropDown create here
	// ==================================================
	useEffect(() => {
		(async () => {
			{
				const data = await getApiData("party");
				const party = data.data.map(d => ({ label: d.name, value: d._id }));
				setParty([...party]);
			}
			{
				const data = await getApiData("account");
				const account = data.data.map(d => ({ label: d.accountName, value: d._id }));
				setAccount([...account])
			}
		})()
	}, [])



	const savePayment = async () => {
		if (formData.party === "")
			return toast("Please select a party", "error");
		else if (formData.paymentInNumber === "")
			return toast("Please enter a payment number", "error");
		else if (formData.paymentInDate === "")
			return toast("Please select a payment date", "error");
		else if (formData.paymentMode === "")
			return toast("Please select a payment mode", "error");
		else if (formData.paymentMode !== Constants.CASH && formData.account === "")
			return toast("Please select an account", "error");


		try {
			const url = process.env.REACT_APP_API_URL + "/paymentin/add";
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(
					!mode ? { ...formData, token, checkedInv }
						: { ...formData, token, update: true, id: id, checkedInv }
				)
			});
			const res = await req.json();
			console.log(res);
			if (req.status !== 200 || res.err) {
				return toast(res.err, 'error');
			}

			if (mode) {
				return toast('Payment update successfully', 'success');
			}

			clear();

			toast('Payment add successfully', 'success');
			navigate('/admin/payment-in');
			return

		} catch (error) {
			return toast('Something went wrong', 'error')
		}

	}

	const clear = () => {
		setFormData({
			party: "", paymentInNumber: "", paymentInDate: "", paymentMode: "", account: "",
			amount: "", details: "", invoiceId: ''
		})
	}


	// On check satelment;
	const handleSettlement = (e, inv) => {
		const { checked } = e.target;
		const due = inv.finalAmount - (inv.paymentAmount || 0);

		if (checked) {
			if (tempAmount <= 0) {
				toast("No amount left to allocate", "error");
				e.preventDefault();
				e.target.checked = false;
				return;
			}

			const alloc = Math.min(tempAmount, due);

			const updatedCheckedInv = [...checkedInv, { ...inv, allocated: alloc }];
			setCheckedInv(updatedCheckedInv);
			setTempAmount(tempAmount - alloc);
		}
		else {
			const existing = checkedInv.find((d) => d._id === inv._id);
			const updatedCheckedInv = checkedInv.filter((d) => d._id !== inv._id);

			if (existing) {
				setTempAmount(tempAmount + existing.allocated);
			}

			setCheckedInv(updatedCheckedInv);
		}
	};


	const searchTable = (e) => {
		const value = e.target.value.toLowerCase();
		const rows = document.querySelectorAll('.payment__satel__table tbody tr');

		rows.forEach(row => {
			const cols = row.querySelectorAll('td');
			let found = false;
			cols.forEach((col, index) => {
				if (index === 2 && col.innerHTML.toLowerCase().includes(value)) {
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




	return (
		<>
			<Nav title={"Add Payment In"} />
			<main id='main'>
				<SideNav />
				<div className='content__body'>
					<div className='content__body__main bg-white'>
						<div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-0'>
							{/* First Column */}
							<div className='flex flex-col gap-2'>
								<div>
									<p className='mb-1'>Select Party</p>
									<MySelect2
										model={Constants.PARTY}
										partyType={Constants.BOTHPARTY}
										onType={(v) => {
											setFormData({ ...formData, party: v })
										}}
										value={formData.party}
									/>
								</div>

								<div>
									<p className='mb-1'>Amount</p>
									<input type='text'
										value={formData.amount}
										onChange={
											checkedInv.length > 0 ? null :
												(e) => setFormData({ ...formData, amount: e.target.value })
										}
									/>
								</div>
							</div>

							{/* Second Column */}
							<div className='flex flex-col gap-2'>
								<div className='w-full flex flex-col md:flex-row gap-4'>
									<div className='w-full'>
										<p className='mb-1'>Payment in Date</p>
										<input type="date"
											onChange={(e) => {
												setFormData({ ...formData, paymentInDate: e.target.value })
											}}
											value={formData.paymentInDate}
											className='w-full'
										/>
									</div>
									<div className='w-full'>
										<p className='mb-1'>Payment in Number</p>
										<input type='text'
											value={formData.paymentInNumber}
											onChange={(e) => setFormData({
												...formData, paymentInNumber: e.target.value
											})}
										/>
									</div>
								</div>
								<div className='w-full flex flex-col md:flex-row gap-4'>
									<div className='w-full'>
										<p className='mb-1'>Payment Mode</p>
										<select value={formData.paymentMode}
											onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
										>
											<option value={Constants.CASH}>Cash</option>
											<option value={Constants.UPI}>UPI</option>
											<option value={Constants.CARD}>Card</option>
											<option value={Constants.NETBENKING}>Netbenking</option>
											<option value={Constants.BANK}>Bank</option>
											<option value={Constants.CHEQUE}>Cheque</option>
											<option value={'balance'}>Current Balance</option>
										</select>
									</div>
									{
										(formData.paymentMode !== Constants.CASH) && (
											<div className='w-full'>
												<p className='mb-1'>Account</p>
												<SelectPicker className='w-full'
													data={account}
													onChange={(v) => setFormData({ ...formData, account: v })}
													value={formData.account}
												/>
											</div>
										)
									}
								</div>
							</div>
						</div>
					</div>

					{/* =================== [SETELMENT] ==================*/}
					{/* ::::::::::::::::::::::::::::::::::::::::::::::::: */}
					<div className='content__body__main mt-3'>
						<div className='satelment__search__area'>
							<p><Icons.INVOICE className='inline' /> Settle invoices with this payment</p>
							<div>
								<Icons.SEARCH />
								<input type="text"
									placeholder='Search Invoice Number'
									onChange={searchTable}
								/>
							</div>
						</div>
						<div className='payment__satelment'>
							<table className='payment__satel__table'>
								<thead>
									<tr>
										<td className='w-[1%]'></td>
										<td className='p-2 font-medium w-[10%]'>Date</td>
										<td className='font-medium w-[10%]'>Invoice Number</td>
										<td className='font-medium w-[10%]'>Invoice Amount</td>
										<td className='font-medium w-[10%]'>Pending Amount</td>
									</tr>
								</thead>
								<tbody>
									{
										invoiceData.length > 0 ? invoiceData.map((inv, i) => {

											return (
												<tr key={i} className='border-gray-300'>
													<td className='p-2' align='center'>
														<input
															type="checkbox"
															onChange={(e) => handleSettlement(e, inv)}
														/>
													</td>
													<td>{inv.invoiceDate.split("T")[0]}</td>
													<td>{inv.salesInvoiceNumber}</td>
													<td>
														<Icons.RUPES className='inline' />
														{inv.finalAmount}
													</td>
													<td>
														<Icons.RUPES className='inline' />
														{inv.finalAmount - inv.paymentAmount}
													</td>
												</tr>
											)
										}) : <tr className='text-center'>
											<td colSpan={5} className='py-5 text-gray-500'>
												No Invoice found
											</td>
										</tr>
									}
								</tbody>
							</table>
						</div>

						<div className='w-full flex justify-end gap-3 mt-3 py-1'>
							<button
								onClick={savePayment}
								className='bg-green-500 hover:bg-green-400 save__and__reset__btns'>
								<Icons.CHECK />
								{!mode ? "Save" : "Update"}
							</button>
							<button
								onClick={clear}
								className='bg-blue-800 hover:bg-blue-700 save__and__reset__btns'>
								<Icons.RESET />
								Reset
							</button>
						</div>
					</div>

				</div>

			</main>

		</>
	)
}

export default AddPayment;
import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { SelectPicker } from 'rsuite';
import useMyToaster from '../../hooks/useMyToaster';
import useApi from '../../hooks/useApi';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { Icons } from '../../helper/icons';
import { Constants } from '../../helper/constants';
import { checkNumber } from '../../helper/validation';



const TransactionAdd = ({ mode }) => {
	const toast = useMyToaster();
	const { id } = useParams();
	const navigate = useNavigate();
	const token = Cookies.get("token");
	const { getApiData } = useApi();
	const currentDate = new Date().toISOString().split("T")[0];
	const [formData, setFormData] = useState({
		transactionType: '', purpose: '', transactionNumber: '', transactionDate: currentDate,
		paymentMode: Constants.CASH, account: '', amount: '', note: ''
	})
	// Store account
	const [account, setAccount] = useState([]);



	useEffect(() => {
		if (mode) {
			(async () => {
				const url = process.env.REACT_APP_API_URL + "/other-transaction/get";
				const req = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ token, id: id })
				})
				const res = await req.json();
				setFormData({ ...formData, ...res.data });
			})()
		}
	}, [mode])


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


	const saveTransaction = async (e) => {
		if (formData.transactionType === "" || formData.purpose === "" || formData.transactionNumber === "" ||
			formData.transactionDate === "" || formData.paymentMode === "" || formData.account === "" || formData.amount === "") {
			return toast("fill the required fields", "error");
		}

		try {
			const url = process.env.REACT_APP_API_URL + "/other-transaction/add";
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(!mode ?
					{ ...formData, token } :
					{ ...formData, token, update: true, id: id }
				)
			})
			const res = await req.json();
			if (req.status !== 200 || res.err) {
				return toast(res.err, 'error');
			}

			if (mode) {
				return toast('Transaction update successfully', 'success');
			}

			clearForm();

			toast('Transaction add successfully', 'success');
			navigate("/admin/other-transaction")
			return;
		} catch (error) {
			return toast('Something went wrong', 'error')
		}

	}

	const clearForm = () => {
		setFormData({
			transactionType: '', purpose: '', transactionNumber: '', transactionDate: '',
			paymentMode: '', account: '', amount: '', note: ''
		})
	}



	return (
		<>
			<Nav title={mode ? "Edit Transactions" : "Add Transactions"} />
			<main id="main">
				<SideNav />
				<div className='content__body '>
					<div className='content__body__main bg-white' >
						<div className='flex justify-between gap-4 flex-col lg:flex-row'>
							<div className='w-full'>
								<div>
									<p> Select Transaction Type</p>
									<select
										onChange={(e) => {
											setFormData({ ...formData, transactionType: e.target.value })
										}}
										value={formData.transactionType}
									>
										<option value="">Select</option>
										<option value="income">Income</option>
										<option value="expense">Expense</option>
									</select>
								</div>
								<div>
									<p className='mt-2'>Purpose</p>
									<input type='text' onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
										value={formData.purpose} />
								</div>
								<div>
									<p className='mt-2'>Transaction Number</p>
									<input type='text' onChange={(e) => setFormData({ ...formData, transactionNumber: e.target.value })}
										value={formData.transactionNumber} />
								</div>
								<div>
									<p className='mt-2'>Transaction Date</p>
									<input type='date' onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
										value={formData.transactionDate} />
								</div>
							</div>
							<div className='w-full'>
								<div className='w-full flex items-center gap-2'>
									<div className='w-full'>
										<p className='ml-1'>Payment Mode</p>
										<select
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
									{
										formData.paymentMode !== Constants.CASH && (
											<div className='w-full'>
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
								<div>
									<p className='mt-2'>Amount</p>
									<input type='text' onChange={(e) =>
										setFormData({ ...formData, amount: checkNumber(e.target.value) })}
										value={formData.amount} />
								</div>
								<div>
									<p className='mt-2'>Note</p>
									<textarea onChange={(e) =>
										setFormData({ ...formData, note: e.target.value })}
										value={formData.note}
									></textarea>
								</div>
							</div>
						</div>
						<div className='w-full flex justify-center gap-3 my-1 mt-5'>
							<button className='add-bill-btn' onClick={saveTransaction}>
								<Icons.CHECK />
								{mode ? "Update" : "Save"}
							</button>
							<button className='reset-bill-btn' onClick={clearForm}>
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

export default TransactionAdd

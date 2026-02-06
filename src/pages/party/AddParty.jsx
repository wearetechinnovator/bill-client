import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import MySelect2 from '../../components/MySelect2';
import { Icons } from '../../helper/icons';
import { Constants } from '../../helper/constants';



const AddParty = ({ mode }) => {
	return (
		<>
			<Nav title={mode ? "Update Party" : "Add Party"} />
			<main id='main'>
				<SideNav />
				<div className="content__body">
					<PartyComponent mode={mode} />
				</div>
			</main >
		</>
	)
}


const PartyComponent = ({ mode, save, getRes }) => {
	const token = Cookies.get("token");
	const { id } = useParams()
	const toast = useMyToaster()
	const [partyData, setPartyData] = useState({
		name: "", type: Constants.CUSTOMER, contactNumber: "", billingAddress: "", shippingAddress: '',
		pan: "", gst: "", openingBalance: "0", details: '', email: '',
		partyCategory: '', creditPeriod: '', creditLimit: '', dob: '', partyCategory: ''
	})
	const navigate = useNavigate();
	const [shipingCheck, setShipingCheck] = useState(true)



	useEffect(() => {
		if (mode) {
			(async () => {
				const url = process.env.REACT_APP_API_URL + "/party/get";

				const req = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ token, id: id })
				})
				const res = await req.json();
				setPartyData({ ...partyData, ...res.data });
			})()
		}
	}, [mode])


	const saveParty = async () => {
		if (partyData.name === "") {
			return toast("Please enter party name", "error");
		}
		if (partyData.contactNumber === "") {
			return toast("Please enter contact number", "error");
		}


		try {
			const url = process.env.REACT_APP_API_URL + "/party/add";
			const token = Cookies.get("token");
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(
					!mode ?
						{ ...partyData, token } :
						{ ...partyData, token, update: true, id: id }
				)
			})
			const res = await req.json();
			if (req.status !== 200 || res.err) {
				return toast(res.err, 'error');
			}

			if (!mode) {
				clear();
			}

			// Send Response to MySelect2 Component for auto select party;
			if (getRes) getRes(res);

			toast(!mode ? "Party create success" : "Party update success", 'success');
			// for close sidebar in MySelect2
			if (save) {
				save(true);
				return
			} else {
				return navigate("/admin/party");
			}

		} catch (error) {
			return toast("Something went wrong", "error")
		}

	}


	const clear = () => {
		setPartyData({
			name: "", type: Constants.CUSTOMER, contactNumber: "", address: "",
			pan: "", gst: "", country: "", state: "", openingBalance: "0",
			details: '', email: '', billingAddress: '', shippingAddress: '',
			creditPeriod: '', creditLimit: '', dob: '', partyCategory: ''
		})
	}


	return (
		<div className="content__body__main ">
			<div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-0'>
				{/* First Column */}
				<div className='flex flex-col gap-2'>
					<div>
						<p className='mb-1'>Party Name <span className='required__text'>*</span></p>
						<input type="text"
							onChange={(e) => setPartyData({ ...partyData, name: e.target.value })}
							value={partyData.name}
						/>
					</div>
					<div>
						<p className='mb-1'>Contact Number <span className='required__text'>*</span></p>
						<input
							type="text"
							onChange={(e) => setPartyData({ ...partyData, contactNumber: e.target.value })}
							value={partyData.contactNumber}
						/>
					</div>
					<div>
						<p className='mb-1'>Party Type <span className='required__text'>*</span></p>
						<select
							onChange={(e) => setPartyData({ ...partyData, type: e.target.value })}
							value={partyData.type}
						>
							<option value={Constants.CUSTOMER}>Customer</option>
							<option value={Constants.SUPPLIER}>Supplier</option>
							<option value={Constants.BOTHPARTY}>Both</option>
						</select>
					</div>

					<div>
						<p className='mb-1'>Credit Period</p>
						<input
							type="text"
							onChange={(e) => setPartyData({ ...partyData, creditPeriod: e.target.value })}
							value={partyData.creditPeriod}
						/>
					</div>

					<div>
						<p className='mb-1'>Party Category</p>
						<MySelect2
							model={"partycategory"}
							onType={(v) => setPartyData({ ...partyData, partyCategory: v })}
							value={partyData.partyCategory}
						/>
					</div>

					<div>
						<p className='mb-1'>Billing Address</p>
						<textarea rows={3}
							className='resize-none'
							value={partyData.billingAddress}
							onChange={(e) => {
								if (shipingCheck) {
									setPartyData({
										...partyData, shippingAddress: e.target.value,
										billingAddress: e.target.value
									})
								} else {
									setPartyData({ ...partyData, billingAddress: e.target.value })
								}
							}}
						></textarea>
					</div>

				</div>

				{/* Second Column */}
				<div className='flex flex-col gap-2'>
					<div className='flex flex-col md:flex-row gap-2 items-center w-full'>
						<div className='w-full'>
							<p className='mb-1'>PAN</p>
							<input type="text"
								onChange={(e) => setPartyData({ ...partyData, pan: e.target.value.toUpperCase() })}
								value={partyData.pan.toUpperCase()}
							/>
						</div>

						<div className='w-full'>
							<p className='mb-1'>GST Number</p>
							<input type="text"
								onChange={(e) => setPartyData({ ...partyData, gst: e.target.value.toUpperCase() })}
								value={partyData.gst.toUpperCase()}
							/>
						</div>
					</div>

					<div>
						<p className='mb-1'>Email</p>
						<input type="email"
							onChange={(e) => setPartyData({ ...partyData, email: e.target.value })}
							value={partyData.email}
						/>
					</div>

					<div>
						<p className='mb-1'>Opening Balance</p>
						<div className='flex items-center border rounded'>
							<Icons.RUPES className='text-[25px] ml-1' />
							<input type="text"
								className='border-none'
								onChange={(e) => setPartyData({ ...partyData, openingBalance: e.target.value })}
								value={partyData.openingBalance}
							/>
							<select
								className='border-none bg-gray-50 rounded-l-none'
							>
								<option value={Constants.COLLECT}>To Collect</option>
								<option value={Constants.PAY}>To Pay</option>
							</select>
						</div>
					</div>

					<div>
						<p className='mb-1'>Credit Limit</p>
						<input type="text"
							onChange={(e) => setPartyData({ ...partyData, creditLimit: e.target.value })}
							value={partyData.creditLimit}
						/>
					</div>

					<div>
						<p className='mb-1'>DOB</p>
						<input type="date"
							onChange={(e) => setPartyData({ ...partyData, dob: e.target.value })}
							value={partyData.dob ? new Date(partyData.dob).toISOString().split('T')[0] : ''}
						/>
					</div>

					<div>
						<div className='mb-1 mt-1 flex items-center'>
							<p>Shipping Address</p>
							<input type="checkbox"
								className='ml-2'
								checked={shipingCheck}
								onChange={(e) => {
									if (e.target.checked) {
										setPartyData({ ...partyData, shippingAddress: partyData.billingAddress })
									} else {
										setPartyData({ ...partyData, shippingAddress: "" })
									}
									setShipingCheck(e.target.checked)
								}}
							/>
							<sub className='ml-1'>Same as billing address</sub>
						</div>
						<textarea rows={3}
							className='resize-none'
							disabled={shipingCheck}
							value={partyData.shippingAddress}
							onChange={(e) => setPartyData({ ...partyData, shippingAddress: e.target.value })}
						></textarea>
					</div>

				</div>
			</div>

			<div className='w-full flex justify-center gap-3 my-3 mt-5'>
				<button
					onClick={saveParty}
					className='add-bill-btn'>
					<Icons.CHECK />
					{!mode ? "Save" : "Update"}
				</button>
				<button
					onClick={clear}
					className='reset-bill-btn'>
					<Icons.RESET />
					Reset
				</button>
			</div>
		</div>
	)
}

export {
	PartyComponent
}

export default AddParty;
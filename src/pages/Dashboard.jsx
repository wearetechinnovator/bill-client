import React, { useState, useEffect } from "react";
import Nav from "../components/Nav";
import SideNav from "../components/SideNav";
import {
	PieChart, Pie, Cell, ResponsiveContainer,
	BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from "recharts";
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';
import { BsArrowRight } from "react-icons/bs";
import useMyToaster from "../hooks/useMyToaster";
import { Constants } from "../helper/constants";
import { Icons } from "../helper/icons";
import DashboardInSighnShimmer from "../components/DashboardInSighnShimmer";
import DataShimmer from "../components/DataShimmer";




const data = [
	{ name: "Cash Account", value: 400, fill: "#0088FE" },
	{ name: "Test", value: 300, fill: "#00C49F" },
	{ name: "Group C", value: 300, fill: "#FFBB28" },
	{ name: "Group D", value: 200, fill: "#FF8042" }
];

const Dashboard = () => {
	const token = Cookies.get("token");
	const toast = useMyToaster();
	const [accountBalanceData, setAccountBalanceData] = useState([])
	const [recentPurchase, setRecentPurchase] = useState([]);
	const [recentSales, setRecentSales] = useState([]);
	const [cashFlowData, setCashFlowData] = useState([]);
	const COLORS = [
		"#00C49F", "#0088FE", "#FF8042", "#FFBB28",
		"#00C49F", "#0088FE", "#FF8042", "#FFBB28",
		"#00C49F", "#0088FE", "#FF8042", "#FFBB28",
		"#00C49F", "#0088FE", "#FF8042", "#FFBB28",
		"#00C49F", "#0088FE", "#FF8042", "#FFBB28",
		"#00C49F", "#0088FE", "#FF8042", "#FFBB28",
		"#00C49F", "#0088FE", "#FF8042", "#FFBB28",
		"#00C49F", "#0088FE", "#FF8042", "#FFBB28"
	];
	const [insighnLoading, setInsightLoading] = useState(true);
	const [recentInvoiceLoading, setRecentInvoiceLoading] = useState(true);

	const [balanceAmount, setBalanceAmount] = useState({});
	const [cashInAmount, setCashInAmount] = useState(0);
	const [cashOutAmount, setCashOutAmount] = useState(0);
	const [totalSaleAmount, setTotalSaleAmount] = useState(0);
	const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);
	const [totalCollect, setTotalCollect] = useState(null);
	const [totalPay, setTotalPay] = useState(null);



	// Get CashIn and CashOut;
	const getCashInAndCashOut = async () => {
		try {
			const [cashIn, cashOut] = await Promise.all([
				fetch(process.env.REACT_APP_API_URL + `/paymentin/get-cashin`, {
					method: "POST",
					headers: { "Content-Type": 'application/json' },
					body: JSON.stringify({ token })
				}).then(res => res.json()),

				fetch(process.env.REACT_APP_API_URL + `/paymentout/get-cashout`, {
					method: "POST",
					headers: { "Content-Type": 'application/json' },
					body: JSON.stringify({ token })
				}).then(res => res.json()),
			]);

			setCashInAmount(cashIn[0].totalCashIn);
			setCashOutAmount(cashOut[0].totalCashOut)

		} catch (err) {
			return toast("Something went wrong", "error")
		}
	}

	const getTotalSaleAmount = async () => {
		try {
			const url = process.env.REACT_APP_API_URL + `/salesinvoice/get-total-sale-amount`;
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": 'application/json'
				},
				body: JSON.stringify({ token })
			});
			const res = await req.json();
			if (req.status !== 200) return toast(res.err, "error");
			setTotalSaleAmount(res[0].totalAmount)
		} catch (err) {
			return toast("Something went wrong", "error")
		}
	}

	const getTotalPurchaseAmount = async () => {
		try {
			const url = process.env.REACT_APP_API_URL + `/purchaseinvoice/get-total-purchase-amount`;
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": 'application/json'
				},
				body: JSON.stringify({ token })
			});
			const res = await req.json();
			if (req.status !== 200) return toast(res.err, "error");
			setTotalPurchaseAmount(res[0].totalAmount)
		} catch (err) {
			return toast("Something went wrong", "error")
		}
	}

	const getTotalCollect = async () => {
		try {
			const url = process.env.REACT_APP_API_URL + `/salesinvoice/get-total-collect`;
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": 'application/json'
				},
				body: JSON.stringify({ token: Cookies.get('token') })
			});
			const res = await req.json();
			if (req.status === 200) {
				if (res.length > 0) {
					setTotalCollect(res[0].totalAmount)
				} else {
					setTotalCollect(0)
				}
			}

		} catch (error) {
			console.log(error)
		}
	}

	const getTotalPay = async () => {
		try {
			const url = process.env.REACT_APP_API_URL + `/purchaseinvoice/get-total-pay`;
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": 'application/json'
				},
				body: JSON.stringify({ token: Cookies.get('token') })
			});
			const res = await req.json();

			if (req.status === 200) {
				if (res.length > 0) {
					setTotalPay(res[0].totalAmount)
				} else {
					setTotalPay(0)
				}
			}

		} catch (error) {
			console.log(error)
		}
	}
	
	useEffect(() => {
		(async () => {
			setInsightLoading(true);
			await getCashInAndCashOut();
			await getTotalSaleAmount();
			await getTotalPurchaseAmount();
			await getTotalCollect();
			await getTotalPay();
			setInsightLoading(false);
		})()
	}, [])

	// Get Payments, Create CashFlow;
	useEffect(() => {
		const cashFlowData = [
			{ name: "Jan" },
			{ name: "Feb" },
			{ name: "Mar" },
			{ name: "Apr" },
			{ name: "May" },
			{ name: "Jun" },
			{ name: "Jul" },
			{ name: "Aug" },
			{ name: "Sep" },
			{ name: "Oct" },
			{ name: "Nov" },
			{ name: "Dec" },
		];

		(async () => {
			try {
				const [res, res2] = await Promise.all([
					fetch(process.env.REACT_APP_API_URL + `/paymentin/month-wise`, {
						method: "POST",
						headers: { "Content-Type": 'application/json' },
						body: JSON.stringify({ token })
					}).then(res => res.json()),

					fetch(process.env.REACT_APP_API_URL + `/paymentout/month-wise`, {
						method: "POST",
						headers: { "Content-Type": 'application/json' },
						body: JSON.stringify({ token })
					}).then(res => res.json()),
				]);

				cashFlowData.forEach((month, index) => {
					month.Collect = res[index]?.totalAmount;
					month.Pay = res2[index]?.totalAmount;
				});

				setCashFlowData(cashFlowData);

			} catch (error) {
				console.log(error)
			}
		})()
	}, []);


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


	// Get Account Details;
	useEffect(() => {
		if (!balanceAmount) return;

		(async () => {
			try {
				const url = process.env.REACT_APP_API_URL + `/account/get?page=${1}&limit=${100000}`;
				const req = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ all: true, token })
				});
				const res = await req.json();

				const accountBalanceDataChartData = res.data.reduce((acc, i) => {
					acc.push({ name: i.accountName, value: balanceAmount[i._id], fill: COLORS[acc.length] });
					return acc;
				}, [])
				accountBalanceDataChartData.push({ name: "Cash", value: balanceAmount['cash'], fill: COLORS[3] });
				setAccountBalanceData(accountBalanceDataChartData)

			} catch (error) {
				console.log(error)
			}
		})()
	}, [balanceAmount])


	// Get Recent Purchase Invoice
	useEffect(() => {
		(async () => {
			try {
				const data = {
					token: Cookies.get("token"),
					all: false
				}
				const url = process.env.REACT_APP_API_URL + `/purchaseinvoice/get?page=${1}&limit=${2}`;
				const req = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify(data)
				});
				const res = await req.json();
				setRecentPurchase(res?.data || []);

			} catch (error) {
				console.log(error)
			}
		})()
	}, [])

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


	return (
		<>
			<Nav title={"Dashboard"} />
			<main id="main">
				<SideNav />
				<div className="content__body p-4">
					<div className="dashboard-main-content glow-shape">
						{/* Summary Cards */}
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
														<h2 className="text-[#333333] font-[700] text-[14px] mb-2">Cash In</h2>
														<p className="text-[14px] text-[#333333]">
															<Icons.RUPES className="inline" />{cashInAmount}
														</p>
													</div>
													<div className="interaction-right-box text-end w-[15%]">
														<div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
													</div>
												</div>
											</div>
											<div className="bg-[#E0F8FF] rounded-[10px] p-4 border shadow">
												<div className="flex content-between">
													<div className="interaction-left-box w-[85%]">
														<h2 className="text-[#333333] font-[700] text-[14px] mb-2">Cash Out</h2>
														<p className=" text-[14px] text-[#333333]">
															<Icons.RUPES className="inline" />{cashOutAmount}
														</p>
													</div>
													<div className="interaction-right-box text-end w-[15%]">
														<div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
													</div>
												</div>
											</div>
											<div className="bg-[#E9E9E9] rounded-[10px] p-4 border shadow">
												<div className="flex content-between">
													<div className="interaction-left-box w-[85%]">
														<h2 className="text-[#333333] font-[700] text-[14px] mb-2">To Collect</h2>
														<p className="text-[14px] text-[#333333]">
															<Icons.RUPES className="inline" />{totalCollect}
														</p>
													</div>
													<div className="interaction-right-box text-end w-[15%]">
														<div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
													</div>
												</div>
											</div>
											<div className="bg-[#E3FFFA] rounded-[10px] p-4 border shadow">
												<div className="flex content-between">
													<div className="interaction-left-box w-[85%]">
														<h2 className="text-[#333333] font-[700] text-[14px] mb-2">To Pay</h2>
														<p className="text-[14px] text-[#333333]">
															<Icons.RUPES className="inline" />{totalPay}
														</p>
													</div>
													<div className="interaction-right-box text-end w-[15%]">
														<div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
													</div>
												</div>
											</div>
											<div className="bg-[#FFFEEF] rounded-[10px] p-4 border shadow">
												<div className="flex content-between">
													<div className="interaction-left-box w-[85%]">
														<h2 className="text-[#333333] font-[700] text-[14px] mb-2">Total Sales</h2>
														<p className="text-[14px] text-[#333333]">
															<Icons.RUPES className="inline" />{totalSaleAmount}
														</p>
													</div>
													<div className="interaction-right-box text-end w-[15%]">
														<div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
													</div>
												</div>
											</div>
											<div className="bg-[#E2FFED] rounded-[10px] p-4 border shadow">
												<div className="flex content-between">
													<div className="interaction-left-box w-[85%]">
														<h2 className="text-[#333333] font-[700] text-[14px] mb-2">Total Purchase</h2>
														<p className="text-[14px] text-[#333333]">
															<Icons.RUPES className="inline" />{totalPurchaseAmount}
														</p>
													</div>
													<div className="interaction-right-box text-end w-[15%]">
														<div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
													</div>
												</div>
											</div>
											<div className="bg-[#FEF2FF] rounded-[10px] p-4 border shadow">
												<div className="flex content-between">
													<div className="interaction-left-box w-[85%]">
														<h2 className="text-[#333333] font-[700] text-[14px] mb-2">Total Expenses</h2>
														<p className="text-[14px] text-[#333333]">1,250$</p>
													</div>
													<div className="interaction-right-box text-end w-[15%]">
														<div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
													</div>
												</div>
											</div>
											<div className="bg-[#FFD9DA] rounded-[10px] p-4 border shadow">
												<div className="flex content-between">
													<div className="interaction-left-box w-[85%]">
														<h2 className="text-[#333333] font-[700] text-[14px] mb-2">Total Income</h2>
														<p className="text-[14px] text-[#333333]">1,250$</p>
													</div>
													<div className="interaction-right-box text-end w-[15%]">
														<div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
													</div>
												</div>
											</div>
										</div>
									) : <DashboardInSighnShimmer />
								}

							</div>
							<div className="dashboard-main-box shadow">
								<h1 className="2xl:text-[20px] xl:text-[20px] text-[#333333] font-[600] mb-[0px] text-left">
									Account Wise Balance
								</h1>
								<div style={{ width: "100%", height: "185px" }}>
									<ResponsiveContainer width="100%" height="100%">
										<PieChart width={400} height={400}>
											<Pie
												data={accountBalanceData}
												cx="40%"
												cy="50%"
												innerRadius={30}
												outerRadius={70}
												fill="#8884d8"
												paddingAngle={0}
												dataKey="value"
											>
											</Pie>
											<Tooltip
												formatter={(value, name) => [`₹ ${value}`, name]}
												contentStyle={{ backgroundColor: "#f5f5f5", borderRadius: "8px", zIndex: "99999" }}
											/>
											<Legend
												layout="vertical"
												align="right"
												verticalAlign="middle"
												wrapperStyle={{
													right: 30,
													top: "30%",
												}}
											// formatter={(value, entry) => {
											// 	return `${value.slice(0,6)}... : ₹ ${entry.payload.value}`;
											// }}
											/>
										</PieChart>
									</ResponsiveContainer>
								</div>
							</div>
						</div>

						{/* Charts */}
						<div className="flex gap-6 mb-6 w-full">
							{/* Bar Chart */}
							<div className="dashboard-main-box w-[60%] shadow">
								<h1 className="2xl:text-[20px] xl:text-[20px] text-[#333333] font-[700] mb-[0px] text-left">
									Cash Flow
								</h1>
								<ResponsiveContainer width="100%" height={270}>
									<BarChart data={cashFlowData}>
										<XAxis dataKey="name" />
										<YAxis />
										<Tooltip />
										<Legend />
										<Bar dataKey="Collect" fill="#00C49F" />
										<Bar dataKey="Pay" fill="#FF5A5F" />
									</BarChart>
								</ResponsiveContainer>
							</div>

							{/* Pie Chart */}
							<div className="dashboard-main-box w-[40%] shadow">
								<h1 className="2xl:text-[20px] xl:text-[20px] text-[#333333] font-[600] mb-[10px] text-left">
									Recent Invoices
								</h1>
								<div className="products-status">
									<table className="table-fixed w-[100%]">
										<tbody>
											{
												recentInvoiceLoading === false ? recentSales.map((rs, i) => {
													let paymentStatus = Constants.UNPAID;
													const paymentAmount = Number(data.paymentAmount) || 0;

													if (data.finalAmount === paymentAmount) {
														paymentStatus = Constants.PAID;
													}
													else if (paymentAmount > 0 && paymentAmount < data.finalAmount) {
														paymentStatus = Constants.PARTIAL_PAID;
													}
													return (
														<tr key={i}>
															<td className="flex items-center gap-[5px] w-[100%] font-(family-name:--heading-font) text-[#333333]">
																{i + 1}. {rs.party.name}
															</td>
															<td className="text-end">
																<span className={`${paymentStatus === Constants.PAID ? 'green-badge' : paymentStatus === Constants.PARTIAL_PAID ? 'yellow-badge' : 'red-badge'} badge capitalize`}>
																	{paymentStatus}
																</span>
															</td>
														</tr>
													)
												}) : <DataShimmer />
											}
										</tbody>
									</table>

								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
};

export default Dashboard;

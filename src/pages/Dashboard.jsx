import React, { useState, useEffect } from "react";
import Nav from "../components/Nav";
import SideNav from "../components/SideNav";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from "recharts";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';
import { BsArrowRight } from "react-icons/bs";




const data = [
  { name: "Group A", value: 400, fill: "#0088FE" },
  { name: "Group B", value: 300, fill: "#00C49F" },
  { name: "Group C", value: 300, fill: "#FFBB28" },
  { name: "Group D", value: 200, fill: "#FF8042" }
];

const Dashboard = () => {
  const [accountBalanceData, setAccountBalanceData] = useState([])
  const [recentPurchase, setRecentPurchase] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [totalCollect, setTotalCollect] = useState(null);
  const [totalPay, setTotalPay] = useState(null);
  const [cashFlowData, setCashFlowData] = useState([]);
  const COLORS = ["#00C49F", "#0088FE", "#FF8042", "#FFBB28"];



  // Get Payment In Details
  useEffect(() => {
    // Dummy data
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
            body: JSON.stringify({ token: Cookies.get("token") })
          }).then(res => res.json()),

          fetch(process.env.REACT_APP_API_URL + `/paymentout/month-wise`, {
            method: "POST",
            headers: { "Content-Type": 'application/json' },
            body: JSON.stringify({ token: Cookies.get("token") })
          }).then(res => res.json()),
        ]);

        cashFlowData.forEach((month, index) => {
          month.Collect = res[index]?.totalAmount || 0;
          month.Pay = res2[index]?.totalAmount || 0;
        });

        setCashFlowData(cashFlowData);

      } catch (error) {
        console.log(error)
      }
    })()
  }, []);


  // Get Account Details;
  useEffect(() => {
    (async () => {
      try {
        const data = {
          token: Cookies.get("token"),
          all: true
        }
        const url = process.env.REACT_APP_API_URL + `/account/get?page=${1}&limit=${100000}`;
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify(data)
        });
        const res = await req.json();

        const accountBalanceDataChartData = res.data.reduce((acc, i) => {
          acc.push({ name: i.title, value: i.openingBalance });
          return acc;
        }, [])

        console.log(accountBalanceDataChartData);

        setAccountBalanceData(accountBalanceDataChartData)

      } catch (error) {
        console.log(error)
      }
    })()
  }, [])


  // Get Total Pay;
  useEffect(() => {
    (async () => {
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

        console.log(res);
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
    })()
  }, [])


  // Get Total Collect;
  useEffect(() => {
    (async () => {
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
    })()
  }, [])

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
      }
    })()
  }, [])

  const renderColorfulLegendText = (value, entry) => {
    return (
      <span style={{ color: "#596579", fontWeight: 500, padding: "10px" }}>
        {value}
      </span>
    );
  };

  return (
    <>
      <Nav title={"Dashboard"} />
      <main id="main">
        <SideNav />
        <div className="content__body p-4">
          <div className="dashboard-main-content glow-shape">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="dashboard-main-box col-span-2 ">
                <h1 className="2xl:text-[20px] xl:text-[20px] text-[#333333] font-[600] mb-[10px] text-left">Insights</h1>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[#E3EAFF] rounded-[10px] p-4 border border-[#4d4d4d]">
                    <div className="flex content-between">
                      <div className="interaction-left-box w-[85%]">
                        <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Cash In</h2>
                        <p className="text-[#000] text-[14px] text-[#333333]">1,250$</p>
                      </div>
                      <div className="interaction-right-box text-end w-[15%]">
                        <div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#E0F8FF] rounded-[10px] p-4 border border-[#4d4d4d]">
                    <div className="flex content-between">
                      <div className="interaction-left-box w-[85%]">
                        <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Cash Out</h2>
                        <p className="text-[#000] text-[14px] text-[#333333]">1,250</p>
                      </div>
                      <div className="interaction-right-box text-end w-[15%]">
                        <div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#E9E9E9] rounded-[10px] p-4 border border-[#4d4d4d]">
                    <div className="flex content-between">
                      <div className="interaction-left-box w-[85%]">
                        <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Customers</h2>
                        <p className="text-[#000] text-[14px] text-[#333333]">11,000</p>
                      </div>
                      <div className="interaction-right-box text-end w-[15%]">
                        <div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#E3FFFA] rounded-[10px] p-4 border border-[#4d4d4d]">
                    <div className="flex content-between">
                      <div className="interaction-left-box w-[85%]">
                        <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Products Sold</h2>
                        <p className="text-[#000] text-[14px] text-[#333333]">1,250$</p>
                      </div>
                      <div className="interaction-right-box text-end w-[15%]">
                        <div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#FFFEEF] rounded-[10px] p-4 border border-[#4d4d4d]">
                    <div className="flex content-between">
                      <div className="interaction-left-box w-[85%]">
                        <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Total Sales</h2>
                        <p className="text-[#000] text-[14px] text-[#333333]">1,250$</p>
                      </div>
                      <div className="interaction-right-box text-end w-[15%]">
                        <div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#E2FFED] rounded-[10px] p-4 border border-[#4d4d4d]">
                    <div className="flex content-between">
                      <div className="interaction-left-box w-[85%]">
                        <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Total Purchase</h2>
                        <p className="text-[#000] text-[14px] text-[#333333]">1,250$</p>
                      </div>
                      <div className="interaction-right-box text-end w-[15%]">
                        <div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#FEF2FF] rounded-[10px] p-4 border border-[#4d4d4d]">
                    <div className="flex content-between">
                      <div className="interaction-left-box w-[85%]">
                        <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Total Expenses</h2>
                        <p className="text-[#000] text-[14px] text-[#333333]">1,250$</p>
                      </div>
                      <div className="interaction-right-box text-end w-[15%]">
                        <div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#FFD9DA] rounded-[10px] p-4 border border-[#4d4d4d]">
                    <div className="flex content-between">
                      <div className="interaction-left-box w-[85%]">
                        <h2 className="text-[#333333] font-[700] text-[14px] mb-2">Total Income</h2>
                        <p className="text-[#000] text-[14px] text-[#333333]">1,250$</p>
                      </div>
                      <div className="interaction-right-box text-end w-[15%]">
                        <div className="round-stroke w-[30px] h-[30px] rounded-[100px] border border-[#000] flex items-center content-center mx-auto"><BsArrowRight size={20} color="#000" className="flex mx-auto" /></div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              <div className="dashboard-main-box">
                <h1 className="2xl:text-[20px] xl:text-[20px] text-[#333333] font-[600] mb-[0px] text-left">
                  Account Wise Balance
                </h1>
                <div style={{ width: "100%", height: "185px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart width={400} height={400}>
                      <Pie
                        data={data}
                        cx="30%"
                        cy="50%"
                        innerRadius={30} // For doughunt
                        outerRadius={70}
                        fill="#8884d8"
                        paddingAngle={0}
                        dataKey="value"
                      >
                      </Pie>
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        wrapperStyle={{
                          right: 90,
                          top: "30%",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="flex gap-6 mb-6 w-full">
              {/* Bar Chart */}
              <div className="dashboard-main-box w-[60%]">
                <h1 className="2xl:text-[20px] xl:text-[20px] text-[#333333] font-[700] mb-[0px] text-left">Cash Flow</h1>
                <ResponsiveContainer width="100%" height={50}>
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
              <div className="dashboard-main-box w-[40%]">
                <h1 className="2xl:text-[20px] xl:text-[20px] text-[#333333] font-[600] mb-[10px] text-left">Recent Invoices</h1>
                {/* <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={accountBalanceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {accountBalanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer> */}

                <div className="products-status">
                  <table className="table-fixed w-[100%]">

                    <tbody>
                      <tr>
                        <td className="flex items-center gap-[5px] w-[100%] font-(family-name:--heading-font) text-[#333333]"> 1. <span> </span> Wordpress</td>
                        <td className="text-end"><div className="active"> <Link src="#"> Complete</Link></div></td>
                      </tr>

                      <tr>
                        <td className="flex items-center gap-[5px] w-[100%] font-(family-name:--heading-font) text-[#333333]"> 2. <span></span> Tripadvisor</td>
                        <td className="text-end"><div className="active red"><Link src="#"> Invoice Pending</Link></div></td>
                      </tr>

                      <tr>
                        <td className="flex items-center gap-[5px] w-[100%] font-(family-name:--heading-font) text-[#333333]"> 3. <span> </span> Slack</td>
                        <td className="text-end"><div className="active red"><Link src="#"> Invoice Pending</Link></div></td>
                      </tr>

                      <tr>
                        <td className="flex items-center gap-[5px] w-[100%] font-(family-name:--heading-font) text-[#333333]"> 4. <span> </span> Zendesk</td>
                        <td className="text-end"><div className="active"><Link src="#"> Complete</Link></div></td>
                      </tr>

                      <tr>
                        <td className="flex items-center gap-[5px] w-[100%] font-(family-name:--heading-font) text-[#333333]"> 5. <span></span> Product Hunt</td>
                        <td className="text-end"><div className="active red"><Link src="#"> Invoice Pending</Link></div></td>
                      </tr>
                      <tr>
                        <td className="flex items-center gap-[5px] w-[100%] font-(family-name:--heading-font) text-[#333333]"> 6. <span> </span> Google</td>
                        <td className="text-end"><div className="active red"><Link src="#"> Invoice Pending</Link></div></td>
                      </tr>
                      <tr>
                        <td className="flex items-center gap-[5px] w-[100%] font-(family-name:--heading-font) text-[#333333]"> 7. <span> </span> Zendesk</td>
                        <td className="text-end"><div className="active"><Link src="#"> Complete</Link></div></td>
                      </tr>


                    </tbody>
                  </table>

                </div>
              </div>
            </div>

            {/* Recent Sales & Purches Table */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            
            <div className="bg-white shadow rounded-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Sales</h3>
                <Link to="/admin/sales-invoice"
                  className="text-xs text-blue-500 hover:text-blue-500 cursor-pointer chart-btn-see">
                  See All
                </Link>
              </div>
              <table className="w-full text-left border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Party</th>
                    <th className="p-2">Invoice No</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    recentSales?.map((s, i) => {
                      return <tr className="border-b" key={i}>
                        <td className="p-2">{s.party?.name}</td>
                        <td className="p-2">{s.salesInvoiceNumber}</td>
                        <td className="p-2">{s.invoiceDate.split("T")[0]}</td>
                        <td className="p-2 text-green-600">{s.finalAmount}</td>
                      </tr>
                    })
                  }
                </tbody>
              </table>
            </div>

           
            <div className="bg-white shadow rounded-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Purchases</h3>
                <Link to="/admin/purchase-invoice"
                  className="text-xs text-blue-500 cursor-pointer chart-btn-see">
                  See All
                </Link>
              </div>
              <table className="w-full text-left border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Party</th>
                    <th className="p-2">Invoice No</th>
                    <th className="p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    recentPurchase?.map((p, i) => {
                      return <tr className="border-b" key={i}>
                        <td className="p-2">{p.party?.name}</td>
                        <td className="p-2">{p.originalInvoiceNumber}</td>
                        <td className="p-2 text-red-600">{p.finalAmount}</td>
                      </tr>
                    })
                  }
                </tbody>
              </table>
            </div>
          </div> */}
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;

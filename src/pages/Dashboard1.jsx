import React, { useState } from "react";
import Nav from "../components/Nav";
import SideNav from "../components/SideNav";

import { PiPrinterFill } from "react-icons/pi";
import { FaCopy, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { LuArrowUpDown } from "react-icons/lu";
import { MdEditSquare } from "react-icons/md";
import { IoInformationCircle } from "react-icons/io5";
import { Pagination } from "rsuite";

document.title = "Dashboard";

// Reusable export & search header
const TableHeader = ({ title }) => (
  <div className="flex justify-between flex-col lg:flex-row gap-3">
    <div className="flex gap-2 pt-4">
      <PiPrinterFill className="bg-[#008AA8] w-[30px] h-[30px] rounded-full p-[8px] text-white" />
      <FaCopy className="bg-[#008AA8] w-[30px] h-[30px] rounded-full p-[8px] text-white" />
      <FaFilePdf className="bg-[#008AA8] w-[30px] h-[30px] rounded-full p-[8px] text-white" />
      <FaFileExcel className="bg-[#008AA8] w-[30px] h-[30px] rounded-full p-[8px] text-white" />
    </div>
    <div className="pt-2">
      <p>Search:</p>
      <input type="text" className="border w-full px-2 py-1 rounded" />
    </div>
  </div>
);

const Dashboard = () => {
  const [accountpaginationPage, setAccountpaginationPage] = useState(1);
  const [recentsalepagination, setRecentsalepagination] = useState(1);
  const [recentpurchasepagination, setRecentpurchasepagination] =
    useState(1);
  const [stockalertpagination, setStockalertpagination] = useState(1);

  return (
    <>
      <Nav title={"Dashboard"} />
      <main id="main" className="flex">
        <SideNav />
        <div className="content__body w-full p-4 space-y-6">
          {/* Summary Cards */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              {/* To Collect */}
              <div>
                <div className="p-3 flex justify-between bg-white rounded-t-lg">
                  <p className="text-2xl text-[#003628] font-semibold">
                    3594.6
                  </p>
                </div>
                <div className="bg-[#006853] w-full rounded-b-lg">
                  <p className="p-2 text-white">To Collect</p>
                </div>
              </div>

              {/* To Pay */}
              <div>
                <div className="p-3 flex justify-between bg-white rounded-t-lg">
                  <p className="text-2xl text-orange-500 font-semibold">
                    424.8
                  </p>
                </div>
                <div className="bg-[#E9762B] w-full rounded-b-lg">
                  <p className="p-2 text-white">To Pay</p>
                </div>
              </div>
            </div>

            {/* Account Wise Balance */}
            <div className="w-full lg:w-2/3 bg-white shadow-sm p-4 rounded-lg">
              <p className="text-lg font-bold">Account Wise Balance</p>
              <TableHeader />
              <table className="w-full border mt-3 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Title</th>
                    <th className="p-2 flex justify-between">
                      <span>Type</span>
                      <LuArrowUpDown />
                    </th>
                    <th className="p-2 flex justify-between">
                      <span>Balance</span>
                      <LuArrowUpDown />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">Cash</td>
                    <td>Cash</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-3 text-sm">Showing 1 to 1 of 1 entries</p>
              <div className="flex justify-end">
                <Pagination
                  total={100}
                  maxButtons={4}
                  activePage={accountpaginationPage}
                  onChangePage={setAccountpaginationPage}
                />
              </div>
            </div>
          </div>

          {/* Sales + Purchases */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Sales */}
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="font-bold text-lg">Recent Due Dates (Sales)</p>
              <TableHeader />
              <div className="overflow-x-auto mt-3">
                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2">Invoice Date</th>
                      <th className="p-2">INV.no.</th>
                      <th className="p-2">Party Name</th>
                      <th className="p-2">Due Date</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2">19 Dec 2024</td>
                      <td>INV3</td>
                      <td>Das Computer</td>
                      <td>28 Dec 2024</td>
                      <td className="flex gap-2 justify-end">
                        <button className="bg-[rgb(0,138,168)] text-white px-2 py-1 rounded">
                          <MdEditSquare />
                        </button>
                        <button className="bg-[#ce0018] text-white px-2 py-1 rounded">
                          <IoInformationCircle />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm">Showing 1 to 1 of 1 entries</p>
              <div className="flex justify-end">
                <Pagination
                  total={100}
                  maxButtons={4}
                  activePage={recentsalepagination}
                  onChangePage={setRecentsalepagination}
                />
              </div>
            </div>

            {/* Recent Purchases */}
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="font-bold text-lg">Recent Due Dates (Purchase)</p>
              <TableHeader />
              <div className="overflow-x-auto mt-3">
                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2">Invoice Date</th>
                      <th className="p-2">INV.no.</th>
                      <th className="p-2">Party Name</th>
                      <th className="p-2">Due Date</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2">28 Dec 2024</td>
                      <td>001</td>
                      <td>Bishai Computer Shop</td>
                      <td>28 Dec 2024</td>
                      <td className="flex gap-2 justify-end">
                        <button className="bg-[rgb(0,138,168)] text-white px-2 py-1 rounded">
                          <MdEditSquare />
                        </button>
                        <button className="bg-[#ce0018] text-white px-2 py-1 rounded">
                          <IoInformationCircle />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm">Showing 1 to 1 of 1 entries</p>
              <div className="flex justify-end">
                <Pagination
                  total={100}
                  maxButtons={4}
                  activePage={recentpurchasepagination}
                  onChangePage={setRecentpurchasepagination}
                />
              </div>
            </div>
          </div>

          {/* Stock Alert */}
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="font-bold text-lg">Stock Alert</p>
            <TableHeader />
            <table className="w-full border mt-3 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Title</th>
                  <th className="p-2 flex justify-between">
                    <span>Stock</span>
                    <LuArrowUpDown />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">Dell Al-mouse</td>
                  <td>✔️</td>
                </tr>
                <tr>
                  <td className="p-2">Birla Cement</td>
                  <td>✔️</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-sm">Showing 1 to 2 of 2 entries</p>
            <div className="flex justify-end">
              <Pagination
                total={100}
                maxButtons={4}
                activePage={stockalertpagination}
                onChangePage={setStockalertpagination}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;

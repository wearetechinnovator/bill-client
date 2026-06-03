import React from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Icons } from '../../helper/icons';
import { Constants } from '../../helper/constants';
import { SelectPicker } from 'rsuite';
import { getAdvanceFilterData } from '../../helper/advanceFilter';
import { useState } from 'react';



const DayBook = () => {
    const [incomeData, setIncomeData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [totalIncome, setTotalIncome] = useState(null);
    const [totalExpenses, setTotalExpenses] = useState(null);
    const [filter, setFilter] = useState({
        startDate: null, endDate: null
    })




    return (
        <>
            <Nav title={"Day Book"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className="content__body__main">
                        {/* Actions */}
                        <div className='w-full flex items-start justify-start mb-2'>
                            <SelectPicker
                                placeholder="Filter Daybook"
                                searchable={false}
                                className='w-[140px]'
                                menuMaxHeight={"250px"}
                                onChange={async (v) => {
                                    if (v === Constants.CUSTOM) {
                                        return;
                                    }
                                    const { fromDate, toDate } = await getAdvanceFilterData(v);
                                    // setFilter({ ...filter, startDate: fromDate, endDate: toDate })
                                    // setIsCustomDate(false);
                                    // setApplyFilter(false);
                                }}
                                data={[
                                    { label: "Today", value: Constants.TODAY },
                                    { label: "Yesterday", value: Constants.YESTERDAY },
                                    { label: "Last 7 Days", value: Constants.LAST7DAY },
                                    { label: "Last 30 Days", value: Constants.LAST30DAY },
                                    { label: "Last 365 Days", value: Constants.LAST365DAY },
                                    { label: "This Week", value: Constants.THISWEEK },
                                    { label: "Last Week", value: Constants.LASTWEEK },
                                    { label: "This Month", value: Constants.THISMONTH },
                                    { label: "Previous Month", value: Constants.PREVMONTH },
                                    { label: "This Quarter", value: Constants.THISQUARTER },
                                    { label: "Last Quarter", value: Constants.LASTQUARTER },
                                    { label: "Current Fiscal Year", value: Constants.CURRENTFISCAL },
                                    { label: "Last Fiscal Year", value: Constants.LASTFISCAL },
                                ]}
                            />
                        </div>

                        <div className='w-full flex items-center flex-col md:flex-row gap-1'>
                            <div className='w-full border rounded'>
                                <p className='font-semibold text-[16px] p-2 px-2 text-[#003E32]'>Income</p>
                                <div>
                                    <div className='w-full flex items-center justify-between p-2 bg-[#F6F9FF] border-y'>
                                        <span>Particulars</span>
                                        <span>Amount</span>
                                    </div>
                                    {
                                        Array.from({ length: 10 }).map((e, _) => {
                                            return (
                                                <div className='w-full flex items-center justify-between p-2 px-4 odd:bg-gray-50'>
                                                    <span>Invoice {_}</span>
                                                    <span className='text-green-600'><Icons.RUPES className='inline' /> 500</span>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            <div className='w-full border rounded'>
                                <p className='font-semibold text-[16px] p-2 px-2 text-[#003E32]'>Expense</p>
                                <div>
                                    <div className='w-full flex items-center justify-between p-2 bg-[#F6F9FF]  border-y'>
                                        <span>Particulars</span>
                                        <span>Amount</span>
                                    </div>
                                    {
                                        Array.from({ length: 10 }).map((e, _) => {
                                            return (
                                                <div className='w-full flex items-center justify-between p-2 px-4 odd:bg-gray-50'>
                                                    <span>Invoice {_}</span>
                                                    <span className='text-red-400'><Icons.RUPES className='inline' /> 500</span>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>

                        <div className='bg-gray-50 p-2 rounded flex items-center mt-1'>
                            <p className='font-semibold mr-2 text-[13px] w-[100px] text-gray-600'>Total Income</p>
                            <span className='text-[13px] flex items-center'>
                                <Icons.RUPES className='inline' />520
                            </span>
                        </div>
                        <div className='bg-gray-50 p-2  flex items-center border-t'>
                            <p className='font-semibold mr-2 text-[13px] w-[100px] text-gray-600'>Total Expenses:</p>
                            <span className='text-[13px] flex items-center'>
                                <Icons.RUPES className='inline' />520
                            </span>
                        </div>
                        <div className='bg-gray-50 p-2 rounded flex items-center border-t'>
                            <p className='font-semibold mr-2 text-[13px] w-[100px] text-gray-600'>Current Balance:</p>
                            <span className='text-[13px] flex items-center'>
                                <Icons.RUPES className='inline' />520
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default DayBook;

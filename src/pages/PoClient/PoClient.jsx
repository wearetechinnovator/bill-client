import React, { useEffect, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Popover, SelectPicker, Whisper } from 'rsuite';
import { BiPrinter } from "react-icons/bi";
import { FaRegCopy, FaRegEdit } from "react-icons/fa";
import { MdFilterList, MdOutlineArrowDropDown } from "react-icons/md";
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
import { IoIosAdd, IoMdInformationCircleOutline, IoMdMore } from 'react-icons/io';
import AddNew from '../../components/AddNew';
import { FiMoreHorizontal } from 'react-icons/fi';
import { RiArrowDropUpFill } from "react-icons/ri";
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import { Icons } from '../../helper/icons';
import { Constants } from '../../helper/constants';
import { getAdvanceFilterData } from '../../helper/advanceFilter';
import ContextMenu from '../../components/ContextMenu';





const PoClient = () => {
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
        return billData && billData.map(({ estimateData, poNumber, party, validDate }) => ({
            "Estimate Data": estimateData,
            "PO Number": poNumber,
            "Party": party.name,
            "Valid Date": validDate
        }));
    }, [billData]);
    const [loading, setLoading] = useState(true);
    const [filterToggle, setFilterToggle] = useState(false);
    const [filter, setFilter] = useState({
        startDate: '', endDate: '', billNo: '', party: '',
    })
    const [ascending, setAscending] = useState(true);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [applyFilter, setApplyFilter] = useState(null);
    const [isCustomDate, setIsCustomDate] = useState(false);




    // Get data;
    const getData = async () => {
        setLoading(true);
        try {
            let data = {
                token: Cookies.get("token"),
                all: tableStatusData === "all" ? true : false
            }
            if (applyFilter) {
                data = {
                    ...data,
                    startDate: filter.startDate,
                    endDate: filter.endDate,
                    partyName: filter.party,
                    billNo: filter.billNo,
                }
            }
            const url = process.env.REACT_APP_API_URL + `/po-client/get?page=${activePage}&limit=${dataLimit}`;
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
            setLoading(false);

        } catch (error) {
            console.log(error)
            return toast("Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        getData();
    }, [tableStatusData, dataLimit, activePage, applyFilter]);

    const sortByDate = () => {
        const sorted = [...billData].sort((a, b) => {
            const dateA = new Date(a.poDate);
            const dateB = new Date(b.poDate);
            return ascending ? dateA - dateB : dateB - dateA;
        });
        setBillData(sorted);
        setAscending(!ascending);
    };

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
            downloadExcel(exportData, 'PO-list.xlsx') // Pass data and filename
        }
        else if (whichType === "print") {
            printTable(tableRef, "PO List"); // Pass table ref and title
        }
        else if (whichType === "pdf") {
            let document = exportPdf('PO List', exportData);
            downloadPdf(document)
        }
    }

    const removeData = async () => {
        if (selected.length === 0 || tableStatusData !== 'active') {
            return;
        }

        const url = process.env.REACT_APP_API_URL + "/po-client/delete";
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
            console.log(error)
            toast("Something went wrong", "error")
        }
    }

    const clearFilterData = () => {
        setFilter({
            startDate: '', endDate: '', billNo: '', party: '',
        })
        setApplyFilter(false);
    }




    return (
        <>
            <Nav title={"PO"} />
            <main id='main'>
                <SideNav />
                <Tooltip id='poTooltip' />
                <ConfirmModal
                    openConfirm={openConfirm}
                    openStatus={(status) => { setOpenConfirm(status) }}
                    title={"Are you sure you want to delete the selected PO?"}
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
                    {/* top section */}
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
                            <div className='flex items-center gap-2 listing__btn_grp'>
                                <button onClick={() => {
                                    setFilterToggle(!filterToggle)
                                }}
                                    className={`${filterToggle ? 'bg-gray-200 border-gray-300' : 'bg-gray-100'} border`}>
                                    <Icons.FILTER size={17} />
                                    Filter
                                </button>
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
                                    onClick={() => navigate("/admin/po-client/add")}
                                    className='bg-[#003E32] text-white '>
                                    <IoIosAdd className='text-xl text-white' />
                                    Add New
                                </button>
                                {
                                    billData?.length > 0 && (
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

                        {
                            filterToggle && (
                                <div>
                                    <hr />
                                    <div className='w-full flex items-center gap-4'>
                                        <div className='w-full'>
                                            <p>Invoice No</p>
                                            <input type="text"
                                                value={filter.billNo}
                                                onChange={(e) => setFilter({ ...filter, billNo: e.target.value })}
                                            />
                                        </div>
                                        <div className='w-full'>
                                            <p>Party Name</p>
                                            <input type="text"
                                                value={filter.party}
                                                onChange={(e) => setFilter({ ...filter, party: e.target.value })}
                                            />
                                        </div>
                                        <div className='w-full'>
                                            <label htmlFor="categorySelect">Search By</label>
                                            <SelectPicker
                                                searchable={false}
                                                className='w-full'
                                                menuMaxHeight={"250px"}
                                                onChange={async (v) => {
                                                    if (v === Constants.CUSTOM) {
                                                        setIsCustomDate(true);
                                                        return;
                                                    }
                                                    const { fromDate, toDate } = await getAdvanceFilterData(v);
                                                    setFilter({ ...filter, startDate: fromDate, endDate: toDate })
                                                    setIsCustomDate(false);
                                                    setApplyFilter(false);
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
                                                    { label: "Custom Date", value: Constants.CUSTOM }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                    <div className='w-full flex items-center gap-4 mt-4'>
                                        {
                                            isCustomDate && (
                                                <>
                                                    <div className='w-full'>
                                                        <p>Start Date</p>
                                                        <input type="date"
                                                            value={filter.startDate}
                                                            onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className='w-full'>
                                                        <p>End Date</p>
                                                        <input type="date"
                                                            value={filter.endDate}
                                                            onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className='w-full'></div>
                                                </>
                                            )
                                        }
                                    </div>

                                    <div className='w-full flex justify-end gap-2 mt-2 pb-2' id='filterBtnGrp'>
                                        <button onClick={() => setApplyFilter(true)}>
                                            <Icons.SEARCH />
                                            Search
                                        </button>
                                        <button onClick={clearFilterData}>
                                            {<Icons.RESET />}
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    </div>

                    {
                        !loading ? billData.length > 0 ? <div className='content__body__main view'>

                            {/* Table start */}
                            <div className='overflow-x-auto list__table'>
                                <table className='min-w-full bg-white' id='listQuotation' ref={tableRef}>
                                    <thead className='list__table__head'>
                                        <tr>
                                            <th className='py-2 px-4 border-b'>
                                                <input
                                                    type='checkbox'
                                                    onChange={selectAll}
                                                    checked={billData.length > 0 && selected.length === billData.length}
                                                />
                                            </th>
                                            <th className='cursor-pointer' onClick={sortByDate}>
                                                <div className='flex items-center justify-start'>
                                                    Date {ascending ? <MdOutlineArrowDropDown /> : <RiArrowDropUpFill />}
                                                </div>
                                            </th>
                                            <th align='left'>PO Number</th>
                                            <th align='left'>Party Name</th>
                                            <th align='center'>PO File Source</th>
                                            <th align='center'>Status</th>
                                            <th align='center'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            billData.map((data, i) => {
                                                let status;
                                                const pending = data.items.every(p => Number(p.invoice_qun) === 0);
                                                const complete = data.items.every(p => Number(p.qun) === 0);
                                                const partial = !pending && !complete;

                                                if (pending)
                                                    status = "pending";
                                                else if (complete)
                                                    status = "complete";
                                                else
                                                    status = "partial";

                                                console.log(status);
                                                return <tr key={i}>
                                                    <td className='py-2' align='center'>
                                                        <input type='checkbox'
                                                            checked={selected.includes(data._id)}
                                                            onChange={() => handleCheckboxChange(data._id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </td>
                                                    <td>{data.poDate.split("T")[0]}</td>
                                                    <td>{data.poNumber}</td>
                                                    <td>{data.party.name}</td>
                                                    <td align='center'>
                                                        <a href={data.driveLink} target='_blank' className='hover:text-black hover:underline'>
                                                            <Icons.EXTRANAL_LINK className='inline' /> Click Here
                                                        </a>
                                                    </td>
                                                    <td align='center'>
                                                        {
                                                            status === 'pending' && (
                                                                <span className='badge yellow-badge'>Pending</span>
                                                            )
                                                        }
                                                        {
                                                            status === 'partial' && (
                                                                <span className='badge indigo-badge'>Partial</span>
                                                            )
                                                        }
                                                        {
                                                            status === 'complete' && (
                                                                <span className='badge green-badge'>Complete</span>
                                                            )
                                                        }
                                                    </td>

                                                    <td className='px-4 text-center'>
                                                        <Whisper
                                                            placement='leftStart'
                                                            trigger={"click"}
                                                            speaker={<Popover full>
                                                                {
                                                                    !data.items.some((f) => f.invoice_qun > 0) && (
                                                                        <div
                                                                            className='table__list__action__icon'
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                navigate(`/admin/po-client/edit/${data._id}`)
                                                                            }}
                                                                        >
                                                                            <FaRegEdit className='text-[16px]' />
                                                                            Edit
                                                                        </div>
                                                                    )
                                                                }
                                                                <div
                                                                    className='table__list__action__icon'
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/admin/sales-invoice/add`, {
                                                                            state: {
                                                                                poClientData: data
                                                                            }
                                                                        })
                                                                    }}
                                                                >
                                                                    <Icons.CONVERT className='text-[16px]' />
                                                                    Convert to Invoice
                                                                </div>
                                                            </Popover>}
                                                        >
                                                            <div className='table__list__action' onClick={(e) => e.stopPropagation()}>
                                                                <FiMoreHorizontal />
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
                            : <AddNew title={"PO"} link={'/admin/po-client/add'} />
                            : <DataShimmer />
                    }
                </div>
            </main>

        </>
    )
}

export default PoClient;


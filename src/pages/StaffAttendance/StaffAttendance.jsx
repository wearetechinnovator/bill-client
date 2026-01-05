import React, { useEffect, useMemo, useRef, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Pagination, Popover, Whisper } from 'rsuite';
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
import { Icons } from '../../helper/icons';
import AttendanceSettingModal from '../../components/AttendanceSettingModal';



const StaffAttendance = () => {
    const toast = useMyToaster();
    const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
    const [activePage, setActivePage] = useState(1);
    const [dataLimit, setDataLimit] = useState(10);
    const [totalData, setTotalData] = useState()
    const [selected, setSelected] = useState([]);
    const navigate = useNavigate();
    const [data, setdata] = useState([]);
    const tableRef = useRef(null);
    const [tableStatusData, setTableStatusData] = useState('active');
    const exportData = useMemo(() => {
        return data && data.map(({ title }) => ({
            Title: title
        }));
    }, [data]);
    const [loading, setLoading] = useState(true);
    const [settingModel, setSettingModel] = useState(false);
    const [attendanceSheet, setAttendanceSheet] = useState([])




    // Get data;
    useEffect(() => {
        const get = async () => {
            try {
                const data = {
                    token: Cookies.get("token"),
                    trash: tableStatusData === "trash" ? true : false,
                    all: tableStatusData === "all" ? true : false
                }
                const url = process.env.REACT_APP_API_URL + `/staff/get?page=${activePage}&limit=${dataLimit}`;
                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                const res = await req.json();

                setTotalData(res.totalData)
                setdata([...res.data]);
                setLoading(false);

            } catch (error) {
                console.log(error)
            }
        }
        get();
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
            setSelected(data.map((e, _) => e._id));
        } else {
            setSelected([]);
        }
    };


    const handleCheckboxChange = (id) => {
        setSelected((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((prevId, _) => prevId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    };


    const exportTable = async (whichType) => {
        if (whichType === "copy") {
            copyTable("listOfTax"); // Pass tableid
        }
        else if (whichType === "excel") {
            downloadExcel(exportData, 'unit-list.xlsx') // Pass data and filename
        }
        else if (whichType === "print") {
            printTable(tableRef, "Unit List"); // Pass table ref and title
        }
        else if (whichType === "pdf") {
            let document = exportPdf('Tax List', exportData);
            downloadPdf(document)
        }
    }

    const removeData = async (trash) => {
        if (selected.length === 0 || tableStatusData !== 'active') {
            return;
        }
        const url = process.env.REACT_APP_API_URL + "/staff/delete";
        try {
            const req = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ids: selected, trash: trash })
            });
            const res = await req.json();

            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            selected.forEach((id, _) => {
                setdata((prevData) => {
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

    const handleAttendance = async (userData, type) => {
        // First check staff id already in array or not;
        // If  id in array then filter it then push it;

    }

    return (
        <>
            <Nav title={"Staff Attendance"} />
            <AttendanceSettingModal
                open={settingModel}
                closeModal={() => setSettingModel(false)}
            />
            <main id='main'>
                <SideNav />
                <Tooltip id='unitTooltip' />
                <div className='content__body'>
                    {/* top section */}
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
                                    onClick={() => removeData(false)}
                                    className={`${selected.length > 0 ? 'bg-red-400 text-white' : 'bg-gray-50'} border `}>
                                    <MdDeleteOutline className='text-md' />
                                    Delete
                                </button>
                                <button
                                    onClick={() => setSettingModel(true)}
                                    className='bg-gray-50 border'
                                >
                                    <Icons.SETTING
                                        className={`text-md text-gray-500 ${settingModel ? 'rotate-90' : ''} transition-all`}
                                    />
                                    Attendance Setting
                                </button>
                                <button
                                    onClick={() => navigate("/admin/staff-attendance/add")}
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

                        <div id='itemFilter'>
                        </div>
                    </div>

                    {
                        !loading ? data.length > 0 ? <div className='content__body__main'>
                            {/* Table start */}
                            <div className='overflow-x-auto list__table'>
                                <table className='min-w-full bg-white' id='listQuotation' ref={tableRef}>
                                    <thead className='list__table__head'>
                                        <tr>
                                            <th className='py-2 px-4 border-b w-[10px]'>
                                                <input type='checkbox' onChange={selectAll} checked={data.length > 0 && selected.length === data.length} />
                                            </th>
                                            <td className='py-2 px-4 border-b'>STAFF NAME</td>
                                            <td className='py-2 px-4 border-b'>MOBILE NUMBER</td>
                                            <td className='py-2 px-4 border-b'>ATTENDANCE</td>
                                            <td className='py-2 px-4 border-b' align='center'>ACTION</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            data.map((data, i) => {
                                                return <tr key={i}>
                                                    <td className='py-2 px-4 border-b'>
                                                        <input type='checkbox'
                                                            checked={selected.includes(data._id)}
                                                            onChange={() => handleCheckboxChange(data._id)}
                                                        />
                                                    </td>
                                                    <td className='px-4 border-b'>{data.staffName}</td>
                                                    <td className='px-4 border-b'>{data.mobileNumber}</td>
                                                    <td className='px-4 border-b'>
                                                        <div className='flex gap-2 items-center'>
                                                            <div
                                                                onClick={() => handleAttendance(data, "P")}
                                                                className='attendance__chip__btn'>
                                                                P
                                                            </div>
                                                            <div
                                                                onClick={() => handleAttendance(data, "A")}
                                                                className='attendance__chip__btn'>
                                                                A
                                                            </div>
                                                            <select className='w-[80px]'>
                                                                <option value="">Select</option>
                                                                <option value="present">Present</option>
                                                                <option value="absent">Absent</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className=''>
                                                        <Whisper
                                                            placement='leftStart'
                                                            trigger={"click"}
                                                            speaker={<Popover full>
                                                                <div
                                                                    className='table__list__action__icon'
                                                                    onClick={() => navigate(`/admin/staff-attendance/edit/${data._id}`)}
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
                                <div className='paginate__parent'>
                                    <p>Showing {data.length} of {totalData} entries</p>
                                    <Pagination
                                        activePage={activePage}
                                        totalData={totalData}
                                        dataLimit={dataLimit}
                                        setActivePage={setActivePage}
                                    />
                                </div>
                            </div>
                        </div>
                            : <AddNew title={"Unit"} link={"/admin/unit/add"} />
                            : <DataShimmer />
                    }
                </div>
            </main>
        </>
    )
}

export default StaffAttendance
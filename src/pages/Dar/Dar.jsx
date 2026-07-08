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
import ContextMenu from '../../components/ContextMenu';
import useTopLoading from '../../hooks/useTopLoadingBar';



// ==========================
// Cold Calling Tracking Page
// ==========================
const statusClass = {
    warm: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    hot: "bg-green-100 text-green-800 border border-green-300",
    cold: "bg-blue-100 text-blue-800 border border-blue-300",
    dead: "bg-red-100 text-red-700 border border-red-300",
};
const Dar = () => {
    const token = Cookies.get("token");
    const toast = useMyToaster();
    const { TopLoadingBar, setTopLoading } = useTopLoading();
    const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
    const [activePage, setActivePage] = useState(1);
    const [dataLimit, setDataLimit] = useState(10);
    const [totalData, setTotalData] = useState();
    const [selected, setSelected] = useState([]);
    const navigate = useNavigate();
    const [darData, setDarData] = useState([]);
    const tableRef = useRef(null);
    const [tableStatusData, setTableStatusData] = useState('active');
    const exportData = useMemo(() => {
        return darData && darData.map((e) => ({
            "Name": e.name,
            "Email": e.email,
            "Phone": e.phone,
            "Designation": e.designation
        }));
    }, [darData]);
    const [loading, setLoading] = useState(true);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [searchText, setSearchText] = useState("");
    let debounceRef = useRef(null);



    // Get data;
    useEffect(() => {
        (async () => {
            try {
                setTopLoading(10);
                const URL = `${process.env.REACT_APP_API_URL}/dar/get-all?page=${activePage}&limit=${dataLimit}`;
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token })
                });
                setTopLoading(30);
                const res = await req.json();
                setTopLoading(60);

                setTotalData(res.totalData)
                setDarData([...res.data]);
                setTopLoading(100);

            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false);
            }
        })()
    }, [tableStatusData, dataLimit, activePage, searchText])


    const selectAll = (e) => {
        if (e.target.checked) {
            setSelected(darData.map(data => {
                if (data.isConverted) {
                    return null;
                }
                return data._id;
            }));
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
            downloadExcel(exportData, 'dar.xlsx') // Pass data and filename
        }
        else if (whichType === "print") {
            printTable(tableRef, "Dar"); // Pass table ref and title
        }
        else if (whichType === "pdf") {
            let document = exportPdf('Dar', exportData);
            downloadPdf(document)
        }
    }




    return (
        <>

            <Nav title={"Cold Calling Tracking"} />
            {TopLoadingBar}
            <main id='main'>
                <SideNav />
                <Tooltip id='accoutnTooltip' />
                <ContextMenu
                    print={() => exportTable('print')}
                    copy={() => exportTable('copy')}
                    pdf={() => exportTable('pdf')}
                    excel={() => exportTable('excel')}
                />
                <div className='content__body'>
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
                            <div className='flex items-center gap-2'>
                                <button
                                    onClick={() => navigate("/admin/dar/add")}
                                    className='bg-[#003E32] text-white '>
                                    <Icons.ADD_CIRCLE size={15} className='text-white' />
                                    Add New
                                </button>
                                {
                                    darData?.length > 0 && (
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
                    </div>

                    {
                        !loading ? (
                            darData.length > 0 ? (
                                <>
                                    <div className='content__body__main view'>
                                        {/* Table start */}
                                        <div className='overflow-x-auto list__table'>
                                            <table className='min-w-full bg-white' id='listQuotation' ref={tableRef}>
                                                <thead className='list__table__head'>
                                                    <tr>
                                                        <th align='left' className='py-2 min-w-[120px]'>Date</th>
                                                        <th align='left'>Lead Source</th>
                                                        <th align='left'>Company Name</th>
                                                        <th align='left'>City</th>
                                                        <th align='left'>Contact Person</th>
                                                        <th align='left'>Email</th>
                                                        <th align='left'>Phone</th>
                                                        <th align='left'>Product Interested</th>
                                                        <th align='left'>Status</th>
                                                        <th align='left'>Follow Up</th>
                                                        <th align='left'>View</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        darData.map((data, i) => {
                                                            return <tr onClick={(e) => { navigate(`/admin/dar/history/${data._id}`) }}
                                                                key={i}
                                                                className='cursor-pointer'
                                                            >
                                                                <td align='left'>{data.createdAt.split("T")[0]}</td>
                                                                <td align='left'>{data.leadSource}</td>
                                                                <td align='left'>{data.companyName || "--"}</td>
                                                                <td align='left'>{data.city}</td>
                                                                <td align='left' className='py-2'>{data.name}</td>
                                                                <td align='left'>{data.email}</td>
                                                                <td align='left'>{data.phone}</td>
                                                                <td align='left'>{data.productInterested}</td>
                                                                <td align='left'>
                                                                    <span
                                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${statusClass[data?.status?.toLowerCase()] ||
                                                                            "bg-gray-100 text-gray-700 border border-gray-300"
                                                                            }`}
                                                                    >
                                                                        {data?.status}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    {
                                                                    data.followUp === 'yes'?(
                                                                        <span className='badge green-badge'>{new Date(data.followUpDate?.split("T")[0]).toLocaleDateString()}</span>
                                                                    ):(
                                                                        <span className='badge yellow-badge'>NO</span>
                                                                    )
                                                                }
                                                                </td>
                                                                <td align='center'>
                                                                    <Icons.EYE />
                                                                </td>
                                                            </tr>
                                                        })
                                                    }
                                                </tbody>
                                            </table>
                                            <p className='mt-2'>Showing {darData.length} of {totalData} entries</p>
                                            <Pagination
                                                activePage={activePage}
                                                totalData={totalData}
                                                dataLimit={dataLimit}
                                                setActivePage={setActivePage}
                                            />
                                            {/* pagination end */}
                                        </div>
                                    </div>
                                </>
                            ) : <AddNew title={"Cold Calling Tracking"} link={"/admin/dar/add"} />
                        ) : <DataShimmer />
                    }
                </div>
            </main>
        </>
    )
}

export default Dar;


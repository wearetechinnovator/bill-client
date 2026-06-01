import { useEffect, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';
import Cookies from 'js-cookie';
import useMyToaster from '../../hooks/useMyToaster';
import downloadPdf from '../../helper/downloadPdf';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import AddNew from '../../components/AddNew';
import { Popover, Whisper } from 'rsuite';
import { Icons } from '../../helper/icons';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import ContextMenu from '../../components/ContextMenu';
import TableNoData from '../../components/TableNoData';



const TOTAL_PARTY = 'total_party';
const TOTAL_PAY = 'total_pay';
const TOTAL_COLLECT = 'total_collect';
const CUSTOMER = 'customer';
const SUPPLIER = 'supplier';
const BOTHPARTY = 'both';
const DEBOUNCE_TIME = 300;
const AssignedParty = () => {
    const token = Cookies.get("token");
    const navigate = useNavigate();
    const toast = useMyToaster();
    const tableRef = useRef(null);
    const [selected, setSelected] = useState([]);
    const [partyData, setPartyData] = useState([]);
    const [tableStatusData, setTableStatusData] = useState('active');
    const [partyBalance, setPartyBalance] = useState([]);
    const exportData = useMemo(() => {
        return partyData && partyData.map((p) => {
            const balance = partyBalance?.find((pb, _) => pb.partyId.toString() === p._id.toString());
            return {
                "Name": p.name,
                "Mobile Number": p.contactNumber,
                "Party Type": p.type,
                "Balance": balance?.balance,
            }
        });
    }, [partyData, partyBalance]);
    const [loading, setLoading] = useState(false);
    const [totalCollection, setTotalCollection] = useState(null);
    const [totalPay, setTotalPay] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedTab, setSelectedTab] = useState(TOTAL_PARTY);
    const [searchText, setSearchText] = useState("");
    let debounceRef = useRef(null);



    // Get Party data;
    const getPartyData = async () => {
        try {
            setLoading(true);
            const data = {
                token,
                all: tableStatusData === "all" ? true : false,
                searchText: searchText
            }
            const url = process.env.REACT_APP_API_URL + `/party/get-assign-party`;
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(data)
            });
            const res = await req.json();

            setPartyData([...res.data]);

        } catch (error) {
            return toast("Party data not get", "error")
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        getPartyData();
    }, [tableStatusData, selectedTab, searchText]);



    const searchData = (e) => {
        const value = e.target.value;
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setSearchText(value);
        }, DEBOUNCE_TIME);
    };


    return (
        <>
            <Nav title={"Parties"} />
            <main id='main' >
                <SideNav />
                <Tooltip id='partyTooltip' />
                <div className="content__body">
                    {
                        !loading ? (partyData.length > 0) ? <div className='content__body__main view'>
                            {/* <div className='flex flex-col md:flex-row justify-between items-center mb-5 gap-8'>
								<div
									onClick={() => setSelectedTab(TOTAL_PARTY)}
									className={`party__data ${selectedTab === TOTAL_PARTY ? 'active' : ''}`}
								>
									<h6><Icons.USERS /> Total Parties</h6>
									<p>{totalData}</p>
								</div>
								<div
									onClick={() => setSelectedTab(TOTAL_PAY)}
									className={`party__data ${selectedTab === TOTAL_PAY ? 'active' : ''}`}
								>
									<h6><Icons.TREDING_DOWN /> Total Amount To Pay</h6>
									<p><Icons.RUPES />{totalPay}</p>
								</div>
								<div
									onClick={() => setSelectedTab(TOTAL_COLLECT)}
									className={`party__data ${selectedTab === TOTAL_COLLECT ? 'active' : ''}`}
								>
									<h6><Icons.TREDING_UP />Total Amount To Collect</h6>
									<p><Icons.RUPES />{totalCollection}</p>
								</div>
							</div> */}

                            {/* Table start */}
                            <div className='overflow-x-auto list__table'>
                                <table className='min-w-full bg-white' id='listOfPartys' ref={tableRef}>
                                    <thead className='list__table__head'>
                                        <tr>
                                            <th className='py-2 w-[40%]' align='left'>Name</th>
                                            <th className='py-2 w-[40%]' align='left'>Mobile Number</th>
                                            <th className='py-2 w-[20%]' align='left'>Party Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            partyData.length > 0 ? partyData.map((data, i) => {
                                                const balance = partyBalance?.find((p, _) => p?.partyId.toString() === data._id.toString());

                                                return <tr key={i} onClick={() => navigate("/admin/party/details/" + data._id)} className='cursor-pointer hover:bg-gray-100'>
                                                    <td className='py-2'>{data.name}</td>
                                                    <td>{data.contactNumber}</td>
                                                    <td>
                                                        <span className='badge green-badge capitalize'>
                                                            {data.type}
                                                        </span>
                                                    </td>
                                                </tr>
                                            }) : (
                                                <TableNoData />
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                            : <div className="content__body__main flex flex-col items-center gap-5">
                                <TableNoData />
                            </div>
                            : <DataShimmer />
                    }
                </div>
            </main >
        </>
    )
}

export default AssignedParty;

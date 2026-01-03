import { useEffect, useMemo, useRef, useState } from 'react'
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



document.title = "Party";
const Party = () => {
  const toast = useMyToaster();
  const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
  const [activePage, setActivePage] = useState(1);
  const [dataLimit, setDataLimit] = useState(10);
  const [totalData, setTotalData] = useState()
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const [partyData, setPartyData] = useState([]);
  const tableRef = useRef(null);
  const [tableStatusData, setTableStatusData] = useState('active');
  const exportData = useMemo(() => {
    return partyData && partyData.map(({ name, type, openingBalance }) => ({
      Name: name,
      Type: type,
      OpeningBalance: openingBalance,
    }));
  }, [partyData]);
  const [loading, setLoading] = useState(true);
  const [totalCollection, setTotalCollection] = useState(null);
  const [totalPay, setTotalPay] = useState(null);



  // Get data;
  useEffect(() => {
    const getParty = async () => {
      try {
        const data = {
          token: Cookies.get("token"),
          trash: tableStatusData === "trash" ? true : false,
          all: tableStatusData === "all" ? true : false
        }
        const url = process.env.REACT_APP_API_URL + `/party/get?page=${activePage}&limit=${dataLimit}`;
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify(data)
        });
        const res = await req.json();
        setTotalData(res.totalData)
        setPartyData([...res.data]);
        setLoading(false);

      } catch (error) {
        console.log(error)
      }
    }
    getParty();
  }, [tableStatusData, dataLimit, activePage]);


  useEffect(() => {
    const getTotalCollectAndPay = async (whichType) => {
      try {
        const url = process.env.REACT_APP_API_URL + `/${whichType}/get`;
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify({ token: Cookies.get("token"), totalPayment: true })
        });
        const res = await req.json();

        if (req.status === 200) {
          if (whichType === "paymentin") {
            setTotalCollection(res.totalAmount);
          } else {
            setTotalPay(res.totalAmount);
          }
        }

      } catch (error) {
        return toast("Can't get total collection", 'error')
      }

    }

    getTotalCollectAndPay("paymentin");
    getTotalCollectAndPay("paymentout");

  }, [])



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
      setSelected(partyData.map(party => party._id));
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
      copyTable("listOfPartys"); // Pass tableid
    }
    else if (whichType === "excel") {
      downloadExcel(exportData, 'party-list.xlsx') // Pass data and filename
    }
    else if (whichType === "print") {
      printTable(tableRef, "Party List"); // Pass table ref and title
    }
    else if (whichType === "pdf") {
      let document = exportPdf('Party List', exportData);
      downloadPdf(document)
    }
  }


  const removeData = async (trash) => {
    if (selected.length === 0 || tableStatusData !== 'active') {
      return;
    }
    const url = process.env.REACT_APP_API_URL + "/party/delete";
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
        setPartyData((prevData) => {
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


  const restoreData = async () => {
    if (selected.length === 0 || tableStatusData !== "trash") {
      return;
    }

    const url = process.env.REACT_APP_API_URL + "/party/restore";
    try {
      const req = await fetch(url, {
        method: "POST",
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
        setPartyData((prevData) => {
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



  return (
    <>
      <Nav title={"Party"} />
      <main id='main' >
        <SideNav />
        <Tooltip id='partyTooltip' />
        <div className="content__body">
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
                <div className='flex w-full flex-col lg:w-[300px]'>
                  <input type='text'
                    placeholder='Search...'
                    onChange={searchTable}
                    className='p-[6px]'
                  />
                </div>
                {/* <button className='bg-gray-100 border'>
                  <MdFilterList className='text-xl' />
                  Filter
                </button> */}
                <button
                  onClick={() => removeData(false)}
                  className={`${selected.length > 0 ? 'bg-red-500 text-white' : 'bg-gray-100'} border`}>
                  <Icons.DELETE className='text-lg' />
                  Delete
                </button>
                <button
                  onClick={() => navigate("/admin/party/add")}
                  className='bg-[#003E32] text-white '>
                  <Icons.ADD className='text-xl text-white' />
                  Add New
                </button>
                <div className='flex justify-end'>
                  <Whisper placement='leftStart' enterable
                    speaker={<Popover full>
                      <div className='download__menu' onClick={() => exportTable('print')} >
                        <Icons.PRINTER className='text-[16px]' />
                        Print Table
                      </div>
                      <div className='download__menu' onClick={() => exportTable('copy')}>
                        <Icons.COPY className='text-[16px]' />
                        Copy Table
                      </div>
                      <div className='download__menu' onClick={() => exportTable('pdf')}>
                        <Icons.PDF className="text-[16px]" />
                        Download Pdf
                      </div>
                      <div className='download__menu' onClick={() => exportTable('excel')} >
                        <Icons.EXCEL className='text-[16px]' />
                        Download Excel
                      </div>
                    </Popover>}
                  >
                    <div className='record__download' >
                      <Icons.MORE />
                    </div>
                  </Whisper>
                </div>
              </div>
            </div>

            <div id='party'>
            </div>
          </div>
          {
            !loading ? partyData.length > 0 ? <div className='content__body__main'>
              <div className='flex flex-col md:flex-row justify-between items-center mb-5 gap-8'>
                <div className='party__data'>
                  <h6><Icons.USERS /> Total Parties</h6>
                  <p>{totalData}</p>
                </div>
                <div className='party__data'>
                  <h6><Icons.TREDING_UP /> Total Amount To Pay</h6>
                  <p><Icons.RUPES />{totalPay}</p>
                </div>
                <div className='party__data'>
                  <h6><Icons.TREDING_DOWN />Total Amount To Collect</h6>
                  <p><Icons.RUPES /> {totalCollection}</p>
                </div>
              </div>

              {/* Table start */}
              <div className='overflow-x-auto list__table'>
                <table className='min-w-full bg-white' id='listOfPartys' ref={tableRef}>
                  <thead className='list__table__head'>
                    <tr>
                      <th className='py-2 px-4 w-[50px]'>
                        <input type='checkbox' onChange={selectAll} checked={partyData.length > 0 && selected.length === partyData.length} />
                      </th>
                      <td className='py-2 px-4'>Name</td>
                      <td className='py-2 px-4'>Phone</td>
                      <td className='py-2 px-4'>Type</td>
                      <td className='py-2 px-4'>Balance</td>
                      <td className='py-2 px-4 w-[100px]'>Action</td>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      partyData.map((data, i) => {
                        return <tr key={i} onClick={() => navigate("/admin/party/details/" + data._id)} className='cursor-pointer hover:bg-gray-100'>
                          <td className='py-2 px-4'>
                            <input type='checkbox' checked={selected.includes(data._id)} onChange={() => handleCheckboxChange(data._id)} />
                          </td>
                          <td className='px-4'>{data.name}</td>
                          <td className='px-4'>{data.contactNumber}</td>
                          <td className='px-4'>
                            <span className='customer_badge'>
                              {data.type}
                            </span>
                          </td>
                          <td className='px-4'>{data.openingBalance}</td>
                          <td className='px-4'>
                            <Whisper
                              onClick={(e) => e.stopPropagation()}
                              placement='leftStart'
                              trigger={"click"}
                              speaker={<Popover full>
                                <div
                                  className='table__list__action__icon'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate("/admin/party/edit/" + data._id)
                                  }}
                                >
                                  <Icons.EDIT className='text-[16px]' />
                                  Edit
                                </div>
                              </Popover>}
                            >
                              <div className='table__list__action' >
                                <Icons.HORIZONTAL_MORE />
                              </div>
                            </Whisper>
                          </td>
                        </tr>
                      })
                    }
                  </tbody>
                </table>
                <div className='paginate__parent'>
                  <p>Showing {partyData.length} of {totalData} entries</p>
                  {/* ----- Paginatin ----- */}
                  <Pagination
                    activePage={activePage}
                    totalData={totalData}
                    dataLimit={dataLimit}
                    setActivePage={setActivePage}
                  />
                  {/* pagination end */}
                </div>
              </div>
            </div>
              : <AddNew title={"Party"} link={"/admin/party/add"} />
              : <DataShimmer />
          }
        </div>
      </main >
    </>
  )
}

export default Party;


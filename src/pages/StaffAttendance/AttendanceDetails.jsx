import { useParams } from 'react-router-dom'
import Nav from '../../components/Nav'
import useMyToaster from '../../hooks/useMyToaster';
import SideNav from '../../components/SideNav'
import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { Icons } from '../../helper/icons';
import AttendanceOverTime from '../../components/AttendanceOverTimeModal';


const AttendanceDetails = () => {
    const toast = useMyToaster();
    const { id } = useParams();
    const [staffData, setStaffData] = useState({})
    const token = Cookies.get("token");
    const attendanceDateRef = useRef(null);
    const [attendanceDatePickerValue, setAttendanceDatePickervalue] = useState();
    const [attendancePickerLabel, setAttendancePickerLabel] = useState("");
    const [tab, setTab] = useState(0); // 0=`Attendance` | 1=`Details`;
    const [datesArr, setDatesArr] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [attendanceSheet, setAttendanceSheet] = useState([]);
    const ATTENDANCE_SAVE_TIME = 2000; // Debounce time;
    const attendanceSaveTimer = useRef(null);
    const [overTimeModal, setOverTimeModal] = useState(false);



    // Set Current month and year
    useEffect(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");

        setAttendanceDatePickervalue(`${year}-${month}`)
        setAttendancePickerLabel(
            new Date(d).toString().split(" ")[1] + " " + new Date(d).toString().split(" ")[3]
        )
    }, [])


    // Get User data
    useEffect(() => {
        (async () => {
            try {
                const url = process.env.REACT_APP_API_URL + "/staff/get";

                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token, id: id })
                })
                const res = await req.json();

                setStaffData({ ...staffData, ...res.data });
            } catch (error) {
                return toast("Staff data not fetch", "error");
            }
        })()
    }, [id])


    // Get User Attendance
    useEffect(() => {
        (async () => {
            if (!attendanceDatePickerValue) return;

            try {
                const url = process.env.REACT_APP_API_URL + "/attendance/get-user-attendance";
                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({
                        token, staffId: id,
                        month: attendanceDatePickerValue.split("-")[1],
                        year: attendanceDatePickerValue.split("-")[0],
                    })
                })
                const res = await req.json();
                setAttendanceData(res.data);

            } catch (error) {
                console.log(error)
                return toast("Staff attendance not fetch", "error");
            }
        })()
    }, [attendanceDatePickerValue])


    // Genarate Dates
    useEffect(() => {
        if (!attendanceDatePickerValue) return;

        const [year, month] = attendanceDatePickerValue.split("-").map(Number);
        const date = new Date(year, month - 1, 1);
        const dates = [];

        while (date.getMonth() === month - 1) {
            dates.push(
                `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
            );
            date.setDate(date.getDate() + 1);
        }

        setDatesArr(dates);
    }, [attendanceDatePickerValue]);


    // Custom Date change on Attendance `Next` | `Prev` Button;
    const dateChanger = (type) => {
        const d = new Date(attendanceDatePickerValue);

        if (type === "prev") {
            d.setMonth(d.getMonth() - 1);
        } else if (type === "next") {
            d.setMonth(d.getMonth() + 1);
        }

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");

        setAttendanceDatePickervalue(`${year}-${month}`);
        setAttendancePickerLabel(
            new Date(d).toString().split(" ")[1] + " " + new Date(d).toString().split(" ")[3]
        )
    };


    // When click attendance button `A` | `P`
    const handleAttendance = async (attendance, type = "none", date) => {
        let attSheet = [...attendanceSheet];
        attSheet = attSheet.filter((a, _) => a.date !== date);

        let attendanceDataSet = {
            staffId: id,
            date: date,
            attendance: attendance, // `P` | `A`
            attendanceType: type
        };


        attSheet.push(attendanceDataSet);
        localStorage.setItem("attendance", JSON.stringify(attSheet));
        localStorage.setItem("attendance_timestamp", Date.now());

        setAttendanceSheet(attSheet);
    }


    // Attendance Debounce Logic here;
    useEffect(() => {
        if (attendanceSaveTimer.current) {
            clearTimeout(attendanceSaveTimer.current);
        }

        const timestamp = Number(localStorage.getItem("attendance_timestamp"));
        if (!timestamp) {
            return
        };

        const elapsed = Date.now() - timestamp;
        const remaining = Math.max(ATTENDANCE_SAVE_TIME - elapsed, 0);

        attendanceSaveTimer.current = setTimeout(() => {
            const attendanceData = JSON.parse(localStorage.getItem('attendance'));

            if (!attendanceData || attendanceData.length === 0) {
                clearTimeout(attendanceSaveTimer.current);
                return;
            }

            (async () => {
                try {
                    const URL = `${process.env.REACT_APP_API_URL}/attendance/add`;
                    const token = Cookies.get("token");
                    const req = await fetch(URL, {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ attendanceData: attendanceSheet, token })
                    })
                    const res = await req.json();
                    if (req.status !== 200) {
                        localStorage.removeItem('attendance');
                        localStorage.removeItem("attendance_timestamp");

                        return toast(res.err, "error")
                    }

                    return toast("Staff attendance successfully", "success");

                } catch (er) {
                    return toast("Attendance failed", "error")
                }
                finally {
                    localStorage.removeItem('attendance');
                    localStorage.removeItem("attendance_timestamp");
                }
            })()

        }, remaining);

        //return () => clearTimeout(attendanceSaveTimer.current);

    }, [attendanceSheet])


    // Jodi page refrash kora hoy r data thake tahole
    // Storage theke data variable a rakha hobe;
    useEffect(() => {
        const attendanceData = JSON.parse(localStorage.getItem("attendance"));

        if (attendanceData && attendanceData.length > 0) {
            setAttendanceSheet(attendanceData);
        }
    }, []);


    const downloadSalarySlip = async () => {
        alert('on going...')
    }


    return (
        <>
            <Nav title={"Staff Attendance Details"} />
            <AttendanceOverTime
                open={overTimeModal}
                closeModal={() => setOverTimeModal(false)}
                staffData={staffData}
                sendData={(d) => {
                    let allSheetData = [...attendanceSheet];

                    let getStaffAttendanceSheet = allSheetData.find((a, _) => a.staffId === d.staffId);
                    allSheetData = allSheetData.filter((a, _) => a.date !== d.date);
                    let marge = { ...getStaffAttendanceSheet, ...d };

                    localStorage.setItem("attendance_timestamp", Date.now());
                    localStorage.setItem("attendance", JSON.stringify([...allSheetData, { ...marge }]));

                    setAttendanceSheet([...allSheetData, { ...marge }]);

                }}
            />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='content__body__main flex items-center justify-between'>
                        <div className='tab'>
                            <button
                                className={`tab__btn ${tab === 0 ? 'active__tab__btn' : ''}`}
                                onClick={() => setTab(0)}
                            >
                                Attendance
                            </button>
                            <button
                                className={`tab__btn ${tab === 1 ? 'active__tab__btn' : ''}`}
                                onClick={() => setTab(1)}
                            >
                                Details
                            </button>
                        </div>

                        <div className='flex items-center gap-2'>
                            <button
                                onClick={downloadSalarySlip}
                                className='border bg-gray-50 rounded px-2 py-1'
                            >
                                <Icons.DOWNLOAD className='inline-block mr-1' />
                                <span>Download Salary Slip</span>
                            </button>
                            <div className='bg-gray-50 h-[30px] border rounded p-1 flex items-center gap-2 w-[125px] justify-center'>
                                <button onClick={(e) => dateChanger("prev")}>
                                    <Icons.PREV_PAGE_ARROW />
                                </button>
                                <div className="relative w-[150px] text-center">
                                    <input
                                        type="month"
                                        ref={attendanceDateRef}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            if (!e.target.value) return;

                                            setAttendanceDatePickervalue(e.target.value)
                                            setAttendancePickerLabel(
                                                new Date(e.target.value).toString().split(" ")[1] + " " + new Date(e.target.value).toString().split(" ")[3]
                                            )
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => attendanceDateRef.current.showPicker()}
                                        className="relative z-10"
                                    >
                                        {attendancePickerLabel || "Select Month"}
                                    </button>
                                </div>
                                <button onClick={() => dateChanger("next")} >
                                    <Icons.NEXT_PAGE_ARROW />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='content__body__main mt-3'>
                        {
                            tab === 0 && (
                                <div className='w-full'>
                                    <p className='text-[15px] font-semibold flex items-center gap-1'>
                                        <Icons.USER className='text-xs' />
                                        {staffData.staffName}
                                    </p>

                                    <div className='overflow-x-auto list__table mt-3'>
                                        <table className='min-w-full bg-white' id='staffTable' >
                                            <thead className='list__table__head'>
                                                <tr>
                                                    <td className='py-2 px-4 border-b w-[30%]'>Date</td>
                                                    <td className='py-2 border-b w-[25%]'>Attendance</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    datesArr.map((date, i) => {
                                                        const attData = attendanceData?.find((at, i) => at.date === date);
                                                        const attendance = attData?.attendance;

                                                        return <tr>
                                                            <td className='py-2 px-4 border-b'>{date}</td>
                                                            <td>
                                                                <div className='flex gap-2 items-center'>
                                                                    <div
                                                                        onClick={() => handleAttendance("1", "none", date)}
                                                                        className={`attendance__chip__btn ${attendance === "1" ? 'attendance__active__present' : ''}`}
                                                                    >
                                                                        P
                                                                    </div>
                                                                    <div
                                                                        onClick={() => handleAttendance("0", "none", date)}
                                                                        className={`attendance__chip__btn ${attendance === "0" ? 'attendance__active__absent' : ''}`}
                                                                    >
                                                                        A
                                                                    </div>
                                                                    {
                                                                        attendance === "0" && (
                                                                            <select
                                                                                className='w-[100px]'
                                                                                onChange={(e) => handleAttendance("0", e.target.value)}
                                                                                value={attData?.attendanceType}
                                                                            >
                                                                                <option value="none">Select</option>
                                                                                <option value="paid-leave">Paid Leave</option>
                                                                                <option value="week-off">Week Off</option>
                                                                            </select>
                                                                        )
                                                                    }
                                                                    {
                                                                        attendance === "1" && (
                                                                            <select
                                                                                className='w-[100px]'
                                                                                onChange={async (e) => {
                                                                                    await handleAttendance("1", e.target.value)
                                                                                    if (e.target.value === "over-time") {
                                                                                        setOverTimeModal(true);
                                                                                    }
                                                                                }}
                                                                                value={attData?.attendanceType}
                                                                            >
                                                                                <option value="none">Select</option>
                                                                                <option value="half-day">Half Day</option>
                                                                                <option value="over-time">Over Time</option>
                                                                            </select>
                                                                        )
                                                                    }
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        }

                        {
                            tab === 1 && (
                                <div className='user__details__tab'>
                                    <div className='flex flex-col gap-5 w-full'>
                                        <div>
                                            <p>Staff Name</p>
                                            <span>{staffData.staffName || "--"}</span>
                                        </div>
                                        <div>
                                            <p>DOB</p>
                                            <span>{staffData?.dob?.split("T")[0] || "--"}</span>
                                        </div>
                                        <div>
                                            <p>Salary</p>
                                            <span>{staffData.salary || "--"}</span>
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-5 w-full'>
                                        <div>
                                            <p>Mobile Number</p>
                                            <span>{staffData.mobileNumber || "--"}</span>
                                        </div>
                                        <div>
                                            <p>Joining Date</p>
                                            <span>{staffData.joiningDate || "--"}</span>
                                        </div>
                                        <div>
                                            <p>Salary Cycle</p>
                                            <span>{staffData.salaryCycle || "--"}</span>
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-5 w-full'>
                                        <div>
                                            <p>Email</p>
                                            <span>{staffData.email || "--"}</span>
                                        </div>
                                        <div>
                                            <p>Salary Payout Type</p>
                                            <span>{staffData.salaryPayOutType || "--"}</span>
                                        </div>
                                        <div>
                                            <p>Outstanding/Opening Balance</p>
                                            <span>{staffData.openingBalance || "--"}</span>
                                            <span className='bg-gray-200 rounded px-1 ml-1 text-gray-500'>
                                                {staffData.openingBalanceType}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </main>
        </>
    )
}

export default AttendanceDetails;

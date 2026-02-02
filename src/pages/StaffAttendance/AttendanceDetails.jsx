import { useParams } from 'react-router-dom'
import Nav from '../../components/Nav'
import useMyToaster from '../../hooks/useMyToaster';
import SideNav from '../../components/SideNav'
import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { Icons } from '../../helper/icons';
import AttendanceOverTime from '../../components/AttendanceOverTimeModal';
import html2pdf from "html2pdf.js";
import SalarySlip from './SalarySlip';
import { useSelector } from 'react-redux';
import { Popover, Whisper } from 'rsuite';



document.title="Staff Attendance"
const AttendanceDetails = () => {
    const userDetails = useSelector((store) => store.userDetail); //get use details from store
    const toast = useMyToaster();
    const { id } = useParams();
    const [staffData, setStaffData] = useState({})
    const token = Cookies.get("token");
    const attendanceDateRef = useRef(null);
    const downloadDateRef = useRef(null);
    const [attendanceDatePickerValue, setAttendanceDatePickervalue] = useState();
    const [attendancePickerLabel, setAttendancePickerLabel] = useState("");
    const [tab, setTab] = useState(0); // 0=`Attendance` | 1=`Details`;
    const [datesArr, setDatesArr] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [downloadAttendanceData, downloadSetAttendanceData] = useState([]);
    const [attendanceSheet, setAttendanceSheet] = useState([]);
    const ATTENDANCE_SAVE_TIME = 2000; // Debounce time;
    const attendanceSaveTimer = useRef(null);
    const [overTimeModal, setOverTimeModal] = useState(false);
    const salaryRef = useRef(null);
    const [allTotalData, setAllTotalData] = useState({
        present: 0, absent: 0, halfDay: 0, paidLeave: 0, weeklyOff: 0, overTime: 0
    })
    const [salarySlipAttendance, setSalarySlipAttendance] = useState({
        present: 0, absent: 0, halfDay: 0, paidLeave: 0, weeklyOff: 0, overTime: 0
    })



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

                if (req.status === 200) {
                    setAttendanceData(res.data);
                    setAttendanceSheet(res.data);

                    const total = res.data.reduce((acc, item) => {
                        if (item.attendance === "1") {
                            acc.p += 1;
                            if (item.attendanceType === "half-day") {
                                acc.hd += 1;
                            }
                            else if (item.attendanceType === "over-time") {
                                acc.ot += 1;
                            }
                        }
                        else if (item.attendance === "0") {
                            acc.a += 1;
                            if (item.attendanceType === "paid-leave") {
                                acc.pl += 1;
                            }
                            else if (item.attendanceType === "week-off") {
                                acc.wo += 1;
                            }
                        }

                        return acc;
                    }, { p: 0, a: 0, hd: 0, pl: 0, wo: 0, ot: 0 })

                    setAllTotalData({
                        present: total.p,
                        absent: total.a,
                        halfDay: total.hd,
                        paidLeave: total.pl,
                        weeklyOff: total.wo,
                        overTime: total.ot
                    })


                    const salaryAttendance = res.data.reduce((acc, i) => {
                        // Present
                        if (i.attendance === "1") {
                            if (i.attendanceType !== "half-day" && i.attendanceType !== "over-time") {
                                acc.p += 1;
                            } else if (i.attendanceType === "half-day") {
                                acc.hd += 1;
                            } else if (i.attendanceType === "over-time") {
                                acc.p += 1;
                                acc.ot += 1;
                            }
                        }
                        // Absent
                        else if (i.attendance === "0") {
                            if (i.attendanceType === "paid-leave") {
                                acc.pl += 1;
                            } else if (i.attendanceType === "week-off") {
                                acc.wo += 1;
                            }
                        }

                        return acc;
                    }, { p: 0, a: 0, hd: 0, pl: 0, wo: 0, ot: 0 });

                    setSalarySlipAttendance({
                        present: salaryAttendance.p,
                        absent: salaryAttendance.a,
                        halfDay: salaryAttendance.hd,
                        paidLeave: salaryAttendance.pl,
                        weeklyOff: salaryAttendance.wo,
                        overTime: salaryAttendance.ot
                    })
                }

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


    // Download Salary Slip by Month Year;
    const downloadSalarySlip = async (date) => {
        const element = salaryRef.current;

        const url = process.env.REACT_APP_API_URL + "/attendance/get-user-attendance";
        const req = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                token, staffId: id,
                year: date.split("-")[0],
                month: date.split("-")[1],
            })
        })
        const res = await req.json();
        if (req.status === 200) {
            downloadSetAttendanceData(res.data)
        }

        const options = {
            margin: 10,
            filename: `${staffData?.staffName}-salary-slip.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        html2pdf().set(options).from(element).save();
    }


    return (
        <>
            <Nav title={"Staff Attendance Details"} />
            <div className='absolute left-[-9999px]'>
                <SalarySlip
                    ref={salaryRef}
                    staffData={staffData}
                    salaryAttendance={salarySlipAttendance}
                    userDetails={userDetails}
                />
            </div>
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
                            <button
                                className={`tab__btn ${tab === 2 ? 'active__tab__btn' : ''}`}
                                onClick={() => setTab(2)}
                            >
                                Payroll
                            </button>
                            <button
                                className={`tab__btn ${tab === 3 ? 'active__tab__btn' : ''}`}
                                onClick={() => setTab(3)}
                            >
                                Transactions
                            </button>
                        </div>

                        <div className='flex items-center gap-2'>
                            <button className='bg-blue-500 text-white px-2 py-1 rounded border-blue-600 border'>
                                <Icons.RUPES className='inline ml-1'/>
                                Make Payment
                            </button>
                            <div className='relative'>
                                <button
                                    onClick={() => downloadDateRef.current.showPicker()}
                                    className='border bg-gray-50 rounded px-2 py-1'
                                >
                                    <Icons.DOWNLOAD className='inline-block mr-1' />
                                    <span>Download Salary Slip</span>

                                    <input
                                        type="month"
                                        ref={downloadDateRef}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={async (e) => {
                                            if (!e.target.value) return;

                                            await downloadSalarySlip(e.target.value)
                                        }}
                                    />
                                </button>
                            </div>

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
                                    <p className='text-[15px] font-semibold '>
                                        <Icons.USER className='text-xs inline mr-1' />
                                        {staffData.staffName}
                                    </p>

                                    <div className='w-full flex items-center justify-between gap-3 mt-2'>
                                        <div className='shadow w-full rounded p-2 bg-[#E2FFED] border-[#4d4d4d] border'>
                                            <p className='feat__card__text'>Present (P)</p>
                                            <span>{allTotalData.present}</span>
                                        </div>
                                        <div className='shadow w-full rounded p-2 bg-[#FFFEEF] border-[#4d4d4d] border'>
                                            <p className='feat__card__text'>Absent (A)</p>
                                            <span>{allTotalData.absent}</span>
                                        </div>
                                        <div className='shadow w-full rounded p-2 bg-[#FEF2FF] border-[#4d4d4d] border'>
                                            <p className='feat__card__text'>Half day (HD)</p>
                                            <span>{allTotalData.halfDay}</span>
                                        </div>
                                        <div className='shadow w-full rounded p-2 bg-[#FFD9DA] border-[#4d4d4d] border'>
                                            <p className='feat__card__text'>Paid leave (PL)</p>
                                            <span>{allTotalData.paidLeave}</span>
                                        </div>
                                        <div className='shadow w-full rounded p-2 bg-[#E3EAFF] border-[#4d4d4d] border'>
                                            <p className='feat__card__text'>Weekly off (WO)</p>
                                            <span>{allTotalData.weeklyOff}</span>
                                        </div>
                                        <div className='shadow w-full rounded p-2 bg-[#E0F8FF] border-[#4d4d4d] border'>
                                            <p className='feat__card__text'>Over Time (OT)</p>
                                            <span>{allTotalData.overTime}</span>
                                        </div>
                                    </div>

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
                                                        const attData = attendanceSheet?.find((at, i) => at.date === date);
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
                                                                            <>
                                                                                <Whisper
                                                                                    placement='leftStart'
                                                                                    trigger={"click"}
                                                                                    speaker={<Popover full>
                                                                                        <div
                                                                                            className='table__list__action__icon'
                                                                                            onClick={() => handleAttendance("0", "paid-leave", date)}
                                                                                        >
                                                                                            Paid Leave
                                                                                        </div>
                                                                                        <div
                                                                                            className='table__list__action__icon'
                                                                                            onClick={() => handleAttendance("0", "week-off", date)}
                                                                                        >
                                                                                            Week Off
                                                                                        </div>
                                                                                    </Popover>}
                                                                                >
                                                                                    <div className='attendance__more__icon' >
                                                                                        <Icons.MORE />
                                                                                    </div>
                                                                                </Whisper>

                                                                                {attData.attendanceType === "paid-leave" && (
                                                                                    <div className={`attendance__chip__btn red`}>
                                                                                        PL
                                                                                    </div>
                                                                                )}

                                                                                {attData.attendanceType === "week-off" && (
                                                                                    <div className={`attendance__chip__btn green`}>
                                                                                        WO
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )
                                                                    }
                                                                    {
                                                                        attendance === "1" && (
                                                                            <>
                                                                                <Whisper
                                                                                    placement='leftStart'
                                                                                    trigger={"click"}
                                                                                    speaker={<Popover full>
                                                                                        <div
                                                                                            className='table__list__action__icon'
                                                                                            onClick={async () => {
                                                                                                await handleAttendance("1", "half-day", date)
                                                                                            }}
                                                                                        >
                                                                                            Half Day
                                                                                        </div>
                                                                                        <div
                                                                                            className='table__list__action__icon'
                                                                                            onClick={async () => {
                                                                                                await handleAttendance("1", "over-time", date);
                                                                                                setOverTimeModal(true);
                                                                                            }}
                                                                                        >
                                                                                            Over Time
                                                                                        </div>
                                                                                    </Popover>}
                                                                                >
                                                                                    <div className='attendance__more__icon' >
                                                                                        <Icons.MORE />
                                                                                    </div>
                                                                                </Whisper>

                                                                                {attData.attendanceType === "half-day" && (
                                                                                    <div className={`attendance__chip__btn yellow`}>
                                                                                        HD
                                                                                    </div>
                                                                                )}

                                                                                {attData.attendanceType === "over-time" && (
                                                                                    <div className={`attendance__chip__btn blue`}>
                                                                                        OT
                                                                                    </div>
                                                                                )}
                                                                            </>
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
                                    <div className='flex flex-col gap-5 w-full pl-2'>
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
                                            {
                                                staffData.openingBalance && <span className='bg-gray-200 rounded px-1 ml-1 text-gray-500'>
                                                    {staffData.openingBalanceType}
                                                </span>
                                            }
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

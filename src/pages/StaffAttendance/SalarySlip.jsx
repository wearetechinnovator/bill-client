import { useRef, forwardRef, useEffect, useState } from 'react'



const SalarySlip = forwardRef(({ staffData, salaryAttendance, userDetails }, ref) => {
    const [companyName, setCompanyName] = useState("");
    const [companyMobile, setCompanyMobile] = useState("");
    const [companyLogo, setCompanyLogo] = useState("");
    const [attendanceAmount, setAttendanceAmount] = useState({
        present: 0, halfDay: 0, paidLeave: 0, weeklyOff: 0, overTime: 0,
        grossEarn: 0
    })



    useEffect(() => {
        if (userDetails) {
            userDetails.companies?.map((c, _) => {
                if (c._id === userDetails.activeCompany) {
                    setCompanyName(c.name);
                    setCompanyMobile(c.phone);
                    setCompanyLogo(c.invoiceLogo);
                }
            })
        }
    }, [userDetails])


    useEffect(() => {
        if (staffData.salary && salaryAttendance) {
            const oneDaySalary = (parseInt(staffData?.salary) / 30).toFixed(2);

            const halfDay = ((oneDaySalary / 2) * parseInt(salaryAttendance.halfDay)).toFixed(2);
            const present = (oneDaySalary * parseInt(salaryAttendance.present)).toFixed(2);
            const weeklyOff = (oneDaySalary * parseInt(salaryAttendance.weeklyOff)).toFixed(2);
            const paidLeave = (oneDaySalary * parseInt(salaryAttendance.paidLeave)).toFixed(2);
            setAttendanceAmount({
                halfDay,
                present,
                weeklyOff,
                paidLeave,
                grossEarn: (parseInt(halfDay) + parseInt(present) + parseInt(weeklyOff) + parseInt(paidLeave)).toFixed(2)
            })
        }
    }, [staffData, salaryAttendance])


    return (
        <div className='salary__slip' ref={ref}>
            <p className='text-gray-400 text-xs'>SALARY SLIP</p>

            <div className='w-full flex gap-5 mt-10 items-start'>
                <img
                    src={companyLogo}
                    className='max-h-[50px]'
                />
                <div>
                    <p className='font-bold text-sm'>{companyName}</p>
                    <span className='text-xs font-bold text-gray-500'>Mobile: {companyMobile}</span>
                </div>
            </div>

            <div className='flex justify-between w-full py-3 border-t mt-8 text-xs'>
                <div className='w-full flex'>
                    <div className='w-full flex flex-col'>
                        <p className='font-bold'>Staff Name</p>
                        <p className='font-bold'>Monthly Salary</p>
                    </div>
                    <div className='w-full flex flex-col'>
                        <p>: {staffData?.staffName}</p>
                        <p>: {staffData?.salary}</p>
                    </div>
                </div>
                <div className='w-full flex'>
                    <div className='w-full flex flex-col'>
                        <p className='font-bold'>Mobile Number</p>
                        <p className='font-bold'>Salary Cycle</p>
                    </div>
                    <div className='w-full flex flex-col'>
                        <p>: {staffData?.mobileNumber}</p>
                        <p>: {staffData?.salaryCycle}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <table className='w-full salary__slip__table'>
                <thead className='bg-blue-50'>
                    <tr>
                        <td>Earning</td>
                        <td align='right'>Amount</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        salaryAttendance.halfDay > 0 && <tr>
                            <td> Half Day ({salaryAttendance.halfDay} days) </td>
                            <td align='right'>
                                {attendanceAmount.halfDay}
                            </td>
                        </tr>
                    }
                    {
                        salaryAttendance.present > 0 && <tr>
                            <td>Present ({salaryAttendance.present} days)</td>
                            <td align='right'>
                                {attendanceAmount.present}
                            </td>
                        </tr>
                    }
                    {
                        salaryAttendance.weeklyOff > 0 && <tr>
                            <td>Weekly Off ({salaryAttendance.weeklyOff} days)</td>
                            <td align='right'>
                                {attendanceAmount.weeklyOff}
                            </td>
                        </tr>
                    }
                    {
                        salaryAttendance.paidLeave > 0 && <tr>
                            <td>Paid Leave ({salaryAttendance.paidLeave} days)</td>
                            <td align='right'>
                                {attendanceAmount.paidLeave}
                            </td>
                        </tr>
                    }

                    <tr>
                        <td className='font-bold'>Gross Earnings</td>
                        <td align='right'>{attendanceAmount.grossEarn}</td>
                    </tr>
                </tbody>
            </table>

            <table className='w-full salary__slip__table mt-5'>
                <thead className='bg-blue-50'>
                    <tr>
                        <td>Payments</td>
                        <td align='right'>Amount</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Paid</td>
                        <td align='right'>320</td>
                    </tr>

                    <tr>
                        <td className='font-bold'>Gross Payment</td>
                        <td align='right'>35452</td>
                    </tr>
                </tbody>
            </table>

            <table className='w-full salary__slip__table mt-5'>
                <tbody>
                    <tr>
                        <td>Previous Month Closing Balance</td>
                        <td align='right'>320</td>
                    </tr>

                    <tr>
                        <td className='font-bold'>Net Payable (Earning + Previous Balance - Payments)</td>
                        <td align='right'>35452</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
})

export default SalarySlip
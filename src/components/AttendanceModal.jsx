import { useEffect, useState } from "react";
import { Modal, Toggle } from "rsuite";


const AttendanceModal = ({ open, closeModal }) => {
    const [modelOpen, setModelOpen] = useState(null);
    const weekDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const [selectedWeekDay, setSelectedWeekDay] = useState([]);


    useEffect(() => {
        console.log("modal status", open);
        setModelOpen(open);
    }, [open])


    return (
        <div>
            <Modal open={modelOpen} size={'xs'} onClose={() => {
                setModelOpen(false);
                closeModal(false);
            }}>
                <Modal.Header className="border-b pb-2 bg-white">
                    <p>Attendance Setting</p>
                    <Modal.Title></Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-white">
                    <div className="border-b flex flex-col px-2 pb-2">
                        <div className="w-full flex items-center justify-between">
                            <p className="text-[13px]">Enable Daily Attendance Reminder</p>
                            <Toggle
                                size={'sm'}
                            />
                        </div>
                        <p className="text-gray-500 text-xs mt-2 mb-1">Reminder time: 10:00</p>
                        <select className="w-[50%]">
                            <option value="10:00">10:00</option>
                            <option value="9:00">9:00</option>
                            <option value="11:00">11:00</option>
                        </select>
                    </div>

                    <div className="w-full border-b flex items-center justify-between py-3 px-2">
                        <p className="text-[13px]">Mark Present By Default</p>
                        <Toggle
                            size={'sm'}
                        />
                    </div>

                    <div className="border-b flex flex-col py-3 px-2">
                        <p className="text-[13px]">Set Up Working Hour In A Shift</p>
                        <p className="text-gray-500 text-xs mt-2 mb-1">Number of hours</p>
                        <div className="w-full flex items-center gap-2">
                            <select className="attendace__setting__time__drp">
                                <option value="10:00">10:00</option>
                                <option value="9:00">9:00</option>
                                <option value="11:00">11:00</option>
                            </select>
                            <span>:</span>
                            <select className="attendace__setting__time__drp">
                                <option value="10:00">10:00</option>
                                <option value="9:00">9:00</option>
                                <option value="11:00">11:00</option>
                            </select>
                        </div>
                        <p className="text-gray-500 text-[11px] mt-2 mb-1">
                            Total working hours in a day = 08:00hrs
                        </p>
                    </div>

                    <div className="flex flex-col py-3 px-2 border-b">
                        <p className="text-[13px]">Set Up Weekly Off</p>
                        <div className="w-full flex items-center gap-2 mt-2">
                            {
                                weekDay.map((day, _) => {
                                    return (
                                        <div key={_}
                                            onClick={() => {
                                                let weekDay = [...selectedWeekDay];

                                                if (weekDay.includes(day)) {
                                                    weekDay = weekDay.filter((d, _) => d !== day);
                                                } else {
                                                    weekDay.push(day)
                                                }
                                                setSelectedWeekDay(weekDay);
                                            }}
                                            className={
                                                `${selectedWeekDay.includes(day) ? 'bg-blue-100 text-blue-500' : 'bg-gray-100'}  
                                                p-[6px] rounded-full text-[11px] cursor-pointer`
                                            }>
                                            {day}
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <p className="text-gray-500 text-[11px] mt-2 mb-1">
                            By default Sundays will be marked weekly off
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex justify-end items-center gap-2">
                        <button
                            onClick={() => { }}
                            className="border bg-gray-50 rounded w-[120px] p-1 text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => { }}
                            className="bg-[#003e32] p-1 rounded w-[120px] text-xs text-white"
                        >
                            Save
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default AttendanceModal
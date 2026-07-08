import React from 'react'
import { Icons } from '../helper/icons'
import { useEffect } from 'react';
import { useState } from 'react';


const ACTIVITY_TYPE = {
    call: {
        icon: <Icons.PHONE_ADD size={17} />,
        color: '#316BF3'
    },
    whatsapp: {
        icon: <Icons.WHATSAPP size={23} />,
        color: '#006E2F'
    },
    message: {
        icon: <Icons.MESSAGE size={23} />,
        color: '#064E3B'
    },
    email: {
        icon: <Icons.EMAIL size={23} />,
        color: '#003E32'
    }
}
const statusClass = {
    warm: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    hot: "bg-green-100 text-green-800 border border-green-300",
    cold: "bg-blue-100 text-blue-800 border border-blue-300",
    dead: "bg-red-100 text-red-700 border border-red-300",
};
const ActivityHistoryCard = ({ data }) => {
    const [date, setDate] = useState('');
    const [currentDay, setCurrentDay] = useState('');
    const [time, setTime] = useState('')


    useEffect(() => {
        const timeStamp = new Date(data?.createdAt);
        const date = timeStamp.getDate();
        const year = timeStamp.getFullYear();
        const month = timeStamp.toString().split(" ")[1];
        const t = timeStamp.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        const day = timeStamp.toLocaleDateString('en-US', { weekday: 'long' });

        setDate(`${month} ${date}, ${year}`);
        setTime(t);
        setCurrentDay(day);
    }, [data])


    return (
        <div className='pl-2 min-h-[150px] w-full flex items-start gap-2'>
            {/* VR LINE WITH ICON */}
            <div className='flex flex-col items-center justify-center w-[40px]'>
                {/* icon */}
                <div className={`w-[30px] h-[30px] rounded-lg grid place-items-center text-white`}
                    style={{ background: ACTIVITY_TYPE[data?.activityType].color }}
                >
                    {ACTIVITY_TYPE[data?.activityType].icon}
                </div>

                {/* line */}
                <div className='w-[1px] h-[150px] bg-[#494848] mt-[2px]'></div>
            </div>

            {/* HISTORY CARD */}
            <div className="bg-white rounded-lg border border-slate-300 w-full flex flex-col md:flex-row gap-2 p-6 hover:border-gray-400">
                <div className='w-full md:w-[20%]'>
                    <p className='font-bold text-lg'>{date}</p>
                    <div className='text-[12px] text-gray-500'>{time} ({currentDay})</div>
                </div>
                <div className='w-[80%]'>
                    <div className='w-full flex justify-between items-center'>
                        <p className='font-bold text-lg'>
                            Initial Client
                            <span className='capitalize font-bold'> {data.activityType}</span>
                        </p>
                        <div>
                            <span className="text-[10px] mr-1 uppercase font-bold">
                                Status:
                            </span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${statusClass[data?.status?.toLowerCase()] ||
                                    "bg-gray-100 text-gray-700 border border-gray-300"
                                    }`}
                            >
                                {data?.status}
                            </span>
                        </div>
                        {
                            data?.followUpDate ? (
                                <div>
                                    <span className='text-[10px] mr-1 uppercase font-bold'>Follow Up Date: </span>
                                    <span className='badge green-badge uppercase'>
                                        {data?.followUpDate?.split("T")[0] || "--"}
                                    </span>
                                </div>
                            ):(
                                 <div>
                                    <span className='text-[10px] mr-1 uppercase font-bold'>Follow Up: </span>
                                    <span className='badge yellow-badge uppercase'>
                                        No
                                    </span>
                                </div>
                            )
                        }
                    </div>
                    <div className='bg-gray-100 p-3 rounded mt-2'>
                        <p className='font-bold mb-1 uppercase text-xs'>Feedback / Note</p>
                        <span className='text-[13px]'>
                            {data?.feedback}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActivityHistoryCard;

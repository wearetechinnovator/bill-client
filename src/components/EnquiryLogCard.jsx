import React from 'react'
import { Icons } from '../helper/icons'

const EnquiryLogCard = ({
    enqNo, date, items, className
}) => {
    return (

        <div className={`w-full flex gap-2 pr-2 bg-gray-50 ${className}`} >
            <div className='flex flex-col justify-center items-center'>
                <div className='w-[14px] h-[16px] bg-[#003E32] rounded-full'></div>
                <div className={`w-[1px] h-full bg-[#003E32]`}></div>
            </div>
            <div className='w-full'>
                <div className='rounded-md w-full hover:border-gray-400 bg-white shadow'>
                    <div className='w-full flex items-center justify-between p-2'>
                        <div className='w-full flex items-center gap-1.5'>
                            <span className='badge green-badge uppercase'>
                                {enqNo}
                            </span>
                            <span className='badge indigo-badge'>
                                <Icons.CALENDAR className='inline mr-[2px] mt-[-2px]' />
                                {date}
                            </span>
                        </div>
                        <div className='flex items-end gap-1'>

                        </div>
                    </div>
                    <table className='w-full p-3 text-xs'>
                        <thead>
                            <tr>
                                <td className='px-2 py-0 font-bold text-[11px]'>Items</td>
                                <td className='font-bold text-[11px]'>QTY</td>
                            </tr>
                        </thead>
                        <tbody className='lowercase'>
                            {
                                items.map((item, i) => {
                                    return (
                                        <tr className={`${i !== (items.length - 1) ? 'border-b border-dashed border-gray-200' : ''}`}>
                                            <td className='px-2 py-1.5'>{item.item.title}</td>
                                            <td>{item.qty}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
                <div className='h-[15px]'></div>
            </div>
        </div>
    )
}

export default EnquiryLogCard;

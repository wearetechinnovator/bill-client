import React, { useEffect, useState } from 'react'

const TopLoadingBar = ({ size = 0 }) => {
    return (
        <div
            className={`fixed top-0 left-0 h-[3px] bg-slate-500 shadow-md shadow-yellow-400 z-[9999] transition-all duration-300 ease-out ${size === 0 ? "opacity-0" : "opacity-100"
                }`}
            style={{ width: `${size}%` }}
        />
    )
}

const useTopLoading = () => {
    const [size, setSize] = useState(0);

    const setTopLoading = (s) => {
        setSize(Math.min(100, Math.max(0, s)));
    };

    useEffect(() => {
        if (size === 100) {
            const timer = setTimeout(() => {
                setSize(0);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [size]);


    return {
        TopLoadingBar: <TopLoadingBar size={size} />,
        setTopLoading
    }
}

export default useTopLoading;

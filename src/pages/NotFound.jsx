import React from 'react'
import { useNavigate } from 'react-router-dom';

const NotFound = () => {

  const navigate = useNavigate();

  return (
    <>
      <main className='pt-[140px]'>
        <div>
          <p className='pt-8 flex justify-center text-4xl'>404 not found</p>
          <p className='pt-9 flex justify-center text-xl'>Sorry, This page doesn't exist </p>
        </div>
        <div className='flex justify-center pt-12 pb-20'>
          <button className='bg-green-700  text-white p-2 text-xl rounded full' onClick={() => navigate('/admin/dashboard')}>
            Go Back
          </button>
        </div>
      </main>
    </>
  )
}

export default NotFound
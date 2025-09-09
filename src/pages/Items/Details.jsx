import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav'
import SideNav from '../../components/SideNav'
import { Icons } from '../../helper/icons'
import { useNavigate, useParams } from 'react-router-dom'
import useApi from '../../hooks/useApi'

const Details = () => {
  const { id } = useParams();
  const [data, setData] = useState();
  const { getApiData } = useApi();
  const [tax, setTax] = useState();
  const navigate = useNavigate();


  useEffect(() => {
    const get = async () => {
      const item = await getApiData("item", id);
      const tax = await getApiData("tax", item?.data?.tax);

      setTax(tax.data[0]);
      setData(item.data);
    }
    get()
  }, [])


  return (
    <>
      <Nav title={"Item Details"} />
      <main id='main'>
        <SideNav />

        <div className="content__body">
          <div className='content__body__main'>
            <div className='details__header'>
              <p>
                <Icons.INVOICE />
                General Details
              </p>
              <Icons.PENCIL
                onClick={() => navigate(`/admin/item/edit/${id}`)}
                className='pencil' />
            </div>
            <hr />

            <div className='flex gap-2 pl-4'>
              <div className='flex flex-col text-xs w-full gap-5'>
                <div>
                  <p className='text-gray-400'>Item Name</p>
                  <p>{data?.title}</p>
                </div>
                <div>
                  <p className='text-gray-400'>Category</p>
                  <p>{data?.category?.name || "--"}</p>
                </div>
                <div>
                  <p className='text-gray-400'>Price</p>
                  <p>{data?.salePrice || "--"}</p>
                </div>
              </div>
              <div className='flex flex-col text-xs w-full gap-5'>
                <div>
                  <p className='text-gray-400'>Type</p>
                  <p>{data?.type || "--"}</p>
                </div>
                <div>
                  <p className='text-gray-400'>Tax</p>
                  <p>{tax?.title || "--"}</p>
                </div>
                <div>
                  <p className='text-gray-400'>HSN</p>
                  <p>{data?.category?.hsn || "--"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Details;

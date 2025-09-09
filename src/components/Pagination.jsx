import { Icons } from "../helper/icons";
import PropTypes from 'prop-types';



const Pagination = ({ activePage, totalData, dataLimit, setActivePage }) => {
  return (
    <div className='flex justify-end'>

      {/****** Back button ******/}
      {
        activePage > 1 ?
          <div onClick={() => setActivePage(activePage - 1)} className='paginate__button__back'>
            <Icons.PREV_PAGE_ARROW />
          </div> : null
      }

      {/******* Paginate count *******/}
      {
        Array.from({ length: Math.ceil((totalData / dataLimit)) }).map((_, i) => {
          return <div
            key={i}
            onClick={() => setActivePage(i + 1)} 
            className={`paginate__button__number ${activePage === i + 1 ? 'active__page' : ''}`}
          >
            {i + 1}
          </div>
        })
      }

      {/******* Next button *******/}
      {
        (totalData / dataLimit) > activePage ?
          <div onClick={() => setActivePage(activePage + 1)} className='paginate__button__next'>
            <Icons.NEXT_PAGE_ARROW />
          </div> : null
      }
    </div>
  )
}


Pagination.propTypes = {
  activePage: PropTypes.number.isRequired,
  totalData: PropTypes.number.isRequired,
  dataLimit: PropTypes.number.isRequired,
  setActivePage: PropTypes.func.isRequired,
};

export default Pagination;

import React, { act, useEffect, useState } from 'react'
import { PiComputerTowerThin } from "react-icons/pi";
import { FaUsers } from "react-icons/fa";
import { TbUsersGroup } from "react-icons/tb";
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { useSelector } from 'react-redux';
import { Icons } from '../helper/icons.js'


const salesPath = [
  "/admin/quotation-estimate",
  "/admin/proforma-invoice",
  "/admin/sales-invoice",
  "/admin/sales-return",
  "/admin/payment-in",
  "/admin/credit-note",
  "/admin/delivery-chalan",
];
const purshasePath = [
  "/admin/purchase-order",
  "/admin/purchase-invoice",
  "/admin/purchase-return",
  "/admin/payment-out",
  "/admin/debit-note",
]
const links = {
  "main": [
    {
      name: 'Dashboard',
      icon: <Icons.USER2 />,
      link: '/admin/dashboard',
      submenu: null
    },
    {
      name: 'Party',
      icon: <FaUsers />,
      link: '/admin/party',
      submenu: null
    },
    {
      name: 'Item',
      icon: <Icons.ITEMS />,
      link: '/admin/item',
      submenu: null
    },
  ],
  "sales": [
    {
      name: 'Quotation / Estimate',
      icon: <Icons.SMAEICON />,
      link: '/admin/quotation-estimate',
      submenu: null
    },
    {
      name: 'Proforma Invoice',
      icon: <Icons.SMAEICON />,
      link: '/admin/proforma-invoice',
      submenu: null
    },
    {
      name: 'Sales Invoice',
      icon: <Icons.SMAEICON />,
      link: '/admin/sales-invoice',
      submenu: null
    },
    {
      name: 'Sales Return',
      icon: <Icons.SMAEICON />,
      link: '/admin/sales-return',
      submenu: null
    },
    {
      name: 'Payment In',
      icon: <Icons.SMAEICON />,
      link: '/admin/payment-in',
      submenu: null
    },
    {
      name: 'Credit Note',
      icon: <Icons.SMAEICON />,
      link: '/admin/credit-note',
      submenu: null
    },
    {
      name: 'Delivery Challan',
      icon: <Icons.SMAEICON />,
      link: '/admin/delivery-chalan',
      submenu: null
    },
  ],
  "Purshase": [
    {
      name: 'Purchase Order',
      icon: <Icons.SMAEICON />,
      link: '/admin/purchase-order',
      submenu: null
    },
    {
      name: 'Purchase Invoice',
      icon: <Icons.SMAEICON />,
      link: '/admin/purchase-invoice',
      submenu: null
    },
    {
      name: 'Purchase Return',
      icon: <Icons.SMAEICON />,
      link: '/admin/purchase-return',
      submenu: null
    },
    {
      name: 'Payment Out',
      icon: <Icons.SMAEICON />,
      link: '/admin/payment-out',
      submenu: null
    },
    {
      name: 'Debit Note',
      icon: <Icons.SMAEICON />,
      link: '/admin/debit-note',
      submenu: null
    },
  ],
  "Accounting": [
    {
      name: 'Accounts',
      icon: <Icons.ACCOUNT />,
      link: '/admin/account',
      submenu: null
    },
    {
      name: 'Other Transactions',
      icon: <Icons.OTHERTRANSACTION />,
      link: '/admin/other-transaction',
      submenu: null
    },
  ],
  "Office": [
    // {
    //   name: 'Manage User',
    //   icon: <FaUsers />,
    //   link: '/admin/account',
    //   submenu: null
    // },
    {
      name: 'Staff Attendance',
      icon: <Icons.PRESENT />,
      link: '/admin/staff-attendance',
      submenu: null
    }
  ],
  "Setup": [
    {
      name: 'Site/Business Settings',
      icon: <Icons.SETTING />,
      link: '/admin/dashboard',
      submenu: null
    },
    {
      name: 'User Management',
      icon: <TbUsersGroup />,
      link: '/admin/dashboard',
      submenu: null
    },
    {
      name: 'Unit',
      icon: <Icons.UNITS />,
      link: '/admin/unit',
      submenu: null
    },
    {
      name: 'Tax',
      icon: <PiComputerTowerThin />,
      link: '/admin/tax',
      submenu: null
    },
  ]
}
const SideNav = () => {
  const userData = useSelector((store) => store.userDetail)
  const activePath = window.location.pathname;
  const [salesOpen, setSalesOpen] = useState(false);
  const [purshaseOpen, setPurshaseOpen] = useState(false);


  // Open Menu Dropdown;
  useEffect(() => {
    if (salesPath.includes(activePath)) {
      setSalesOpen(true);
    } else if (purshasePath.includes(activePath)) {
      setPurshaseOpen(true);
    }
  }, [activePath])


  return (
    <aside className='side__nav  min-w-[175px] h-[calc(100vh-50px)] bg-[#003e32] text-white' id='sideBar'>
      <div className="side__nav__logo flex justify-center items-center">
      </div>
      <div className="side__nav__links pb-3">
        <div className="side__nav__link__group">
          <ul>
            {links.main.map((link, index) => (
              <Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
                <li className={`flex items-center ${link.link === activePath ? 'active__link' : ''}`} >
                  <span className='mr-3'>{link.icon}</span>
                  <span>{link.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        </div>

        <div className="side__nav__link__group">
          <h3
            onClick={() => setSalesOpen(!salesOpen)}
            className='text-[16px] my-3 flex items-center justify-between cursor-pointer'>
            Sales
            <span className='mr-1'>
              {
                salesOpen ? <Icons.MENU_DOWN_ARROW className='text-[14px]' /> :
                  <Icons.MENU_UP_ARROW className='text-[14px]' />
              }
            </span>
          </h3>
          {
            salesOpen && (
              <ul className='bg-slate-700'>
                {links.sales.map((link, index) => (
                  <Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
                    <li className={`flex items-center ${activePath.search(link.link) >= 0 ? 'active__link' : ''}`}>
                      <span className='mr-3'>{link.icon}</span>
                      <span>{link.name}</span>
                    </li>
                  </Link>
                ))}
              </ul>
            )
          }
        </div>

        <div className="side__nav__link__group">
          <h3
            onClick={() => setPurshaseOpen(!purshaseOpen)}
            className='text-[16px] my-3 flex items-center justify-between cursor-pointer'>
            Purshase
            <span className='mr-1'>
              {
                purshaseOpen ? <Icons.MENU_DOWN_ARROW className='text-[14px]' /> :
                  <Icons.MENU_UP_ARROW className='text-[14px]' />
              }
            </span>
          </h3>
          {
            purshaseOpen && (
              <ul className='bg-slate-700'>
                {links.Purshase.map((link, index) => (
                  <Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
                    <li className={`flex items-center ${activePath.search(link.link) >= 0 ? 'active__link' : ''}`}>
                      <span className='mr-3'>{link.icon}</span>
                      <span >{link.name}</span>
                    </li>
                  </Link>
                ))}
              </ul>
            )
          }
        </div>

        <div className="side__nav__link__group">
          <h3 className='text-[16px] my-5'>Accounting Solution</h3>
          <ul className=''>
            {links.Accounting.map((link, index) => (
              <Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
                <li className={`flex items-center ${activePath.search(link.link) >= 0 ? 'active__link' : ''}`}>
                  <span className='mr-3'>{link.icon}</span>
                  <span >{link.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        </div>

        <div className="side__nav__link__group">
          <h3 className='text-[16px] my-5'>Office Solution</h3>
          <ul className=''>
            {links.Office.map((link, index) => (
              <Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
                <li className={`flex items-center ${activePath.search(link.link) >= 0 ? 'active__link' : ''}`}>
                  <span className='mr-3'>{link.icon}</span>
                  <span >{link.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        </div>

        <div className="side__nav__link__group">
          <h3 className='text-[16px] my-5'>Setup</h3>
          <ul>
            <Link to={"/admin/site"} data-tooltip-id="sideBarItemToolTip">
              <li className={`flex items-center ${activePath.search("/admin/site") >= 0 ? 'active__link' : ''}`}>
                <span className='mr-3'><Icons.SETTING /></span>
                <span>Site/Business Settings</span>
              </li>
            </Link>
            <Link to={"/admin/unit"} data-tooltip-id="sideBarItemToolTip">
              <li className={`flex items-center ${activePath.search("/admin/unit") >= 0 ? 'active__link' : ''}`}>
                <span className='mr-3'><Icons.UNITS /></span>
                <span>Unit</span>
              </li>
            </Link>
            <Link to={"/admin/tax"} data-tooltip-id="sideBarItemToolTip">
              <li className={`flex items-center ${activePath.search("/admin/tax") >= 0 ? 'active__link' : ''}`}>
                <span className='mr-3'><Icons.TAXES /></span>
                <span>Tax</span>
              </li>
            </Link>
            <Link to={"/admin/item-category"} data-tooltip-id="sideBarItemToolTip">
              <li className={`flex items-center ${activePath.search("/admin/item-category") >= 0 ? 'active__link' : ''}`}>
                <span className='mr-3'><Icons.CATEGORY /></span>
                <span>Category</span>
              </li>
            </Link>
          </ul>
        </div>
      </div>
      <Tooltip id='sideBarItemToolTip' className='z-50' />
    </aside>
  );
}

export default SideNav;
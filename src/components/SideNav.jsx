import React, { useEffect, useState } from 'react'
import { PiComputerTowerThin } from "react-icons/pi";
import { FaUsers } from "react-icons/fa";
import { TbUsersGroup } from "react-icons/tb";
import { Link, useLocation } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { useSelector } from 'react-redux';
import { Icons } from '../helper/icons.js'



const ROLE = {
  ADMIN: 'admin',
  SALES: 'sales',
  MANAGER: 'manager',
  ACCOUNTANT: 'accountant'
};

const salesPath = [
  "/admin/quotation-estimate",
  "/admin/quotation-estimate/add",
  "/admin/quotation-estimate/edit",
  "/admin/proforma-invoice",
  "/admin/proforma-invoice/add",
  "/admin/proforma-invoice/edit",
  "/admin/sales-invoice",
  "/admin/sales-invoice/add",
  "/admin/sales-invoice/edit",
  "/admin/sales-return",
  "/admin/sales-return/add",
  "/admin/sales-return/edit",
  "/admin/payment-in",
  "/admin/payment-in/add",
  "/admin/payment-in/edit",
  "/admin/credit-note",
  "/admin/credit-note/add",
  "/admin/credit-note/edit",
  "/admin/delivery-chalan",
  "/admin/delivery-chalan/add",
  "/admin/delivery-chalan/edit",
];

const purshasePath = [
  "/admin/purchase-order",
  "/admin/purchase-order/add",
  "/admin/purchase-order/edit",
  "/admin/purchase-invoice",
  "/admin/purchase-invoice/add",
  "/admin/purchase-invoice/edit",
  "/admin/purchase-return",
  "/admin/purchase-return/add",
  "/admin/purchase-return/edit",
  "/admin/payment-out",
  "/admin/payment-out/add",
  "/admin/payment-out/edit",
  "/admin/debit-note",
  "/admin/debit-note/add",
  "/admin/debit-note/edit",
];

const links = {
  "main": [
    { name: 'Dashboard', icon: <Icons.USER2 />, link: '/admin/dashboard' },
    { name: 'Party', icon: <FaUsers />, link: '/admin/party' },
    { name: 'Party', icon: <FaUsers />, link: '/admin/assigned-party' },
    { name: 'Item', icon: <Icons.ITEMS />, link: '/admin/item' },
    { name: 'Enquiry', icon: <Icons.ENQUIRY />, link: '/admin/enquiry' },
    { name: 'DAR', icon: <Icons.DAILY_REPORT />, link: '/admin/dar' },
  ],
  "sales": [
    { name: 'Quotation / Estimate', icon: <Icons.SMAEICON />, link: '/admin/quotation-estimate' },
    { name: 'Proforma Invoice', icon: <Icons.SMAEICON />, link: '/admin/proforma-invoice' },
    { name: 'Sales Invoice', icon: <Icons.SMAEICON />, link: '/admin/sales-invoice' },
    { name: 'Sales Return', icon: <Icons.SMAEICON />, link: '/admin/sales-return' },
    { name: 'Payment In', icon: <Icons.SMAEICON />, link: '/admin/payment-in' },
    { name: 'Credit Note', icon: <Icons.SMAEICON />, link: '/admin/credit-note' },
    { name: 'Delivery Challan', icon: <Icons.SMAEICON />, link: '/admin/delivery-chalan' },
  ],
  "Purshase": [
    { name: 'Purchase Order', icon: <Icons.SMAEICON />, link: '/admin/purchase-order' },
    { name: 'Purchase Invoice', icon: <Icons.SMAEICON />, link: '/admin/purchase-invoice' },
    { name: 'Purchase Return', icon: <Icons.SMAEICON />, link: '/admin/purchase-return' },
    { name: 'Payment Out', icon: <Icons.SMAEICON />, link: '/admin/payment-out' },
    { name: 'Debit Note', icon: <Icons.SMAEICON />, link: '/admin/debit-note' },
  ],
  "Accounting": [
    { name: 'Accounts', icon: <Icons.ACCOUNT />, link: '/admin/account' },
    { name: 'Other Transactions', icon: <Icons.OTHERTRANSACTION />, link: '/admin/other-transaction' },
  ],
  "Report": [
    { name: 'Day Book', icon: <Icons.BOOK />, link: '/report/daybook' },
    { name: 'Party Statement', icon: <Icons.LADGER_USER />, link: '/report/party-statement' },
  ],
};


// Role Links
const salesAllowLinks = [
  "/admin/dashboard",
  "/admin/assigned-party",

  // Unit
  // "/admin/unit",
  // "/admin/unit/add",
  // "/admin/unit/edit",

  // Tax
  // "/admin/tax",
  // "/admin/tax/add",
  // "/admin/tax/edit",

  // Item Category
  "/admin/item-category",
  "/admin/item-category/add",
  "/admin/item-category/edit",
  "/admin/item-category/details",

  // Item
  "/admin/item",
  "/admin/item/add",
  "/admin/item/edit",
  "/admin/item/details",

  // Quotation
  "/admin/quotation-estimate",
  "/admin/quotation-estimate/add",
  "/admin/quotation-estimate/edit",

  // Proforma Invoice
  "/admin/proforma-invoice",
  "/admin/proforma-invoice/add",
  "/admin/proforma-invoice/convert/add/",
  "/admin/proforma-invoice/edit",

  // Sales Invoice
  "/admin/sales-invoice",
  "/admin/sales-invoice/add",
  "/admin/sales-invoice/edit",
  "/admin/sales-invoice/convert/add/",

  // Sales Return
  "/admin/sales-return",
  "/admin/sales-return/add",
  "/admin/sales-return/edit",

  // Payment In
  "/admin/payment-in",
  "/admin/payment-in/add",
  "/admin/payment-in/edit",

  // Credit Note
  "/admin/credit-note",
  "/admin/credit-note/add",
  "/admin/credit-note/edit",

  // Delivery Challan
  "/admin/delivery-chalan",
  "/admin/delivery-chalan/add",
  "/admin/delivery-chalan/edit",

  // Enquiry
  "/admin/enquiry",
  "/admin/enquiry/add",
  "/admin/enquiry/edit",
];

const managerNotAllowLinks = [
  "/admin/account",
  "/admin/account/add",
  "/admin/account/edit/",
  "/admin/other-transaction/add",
  "/admin/other-transaction/edit",
  "/admin/other-transaction",
  "/admin/balance-sheet",
  "/admin/assigned-party",
  "/admin/user-profile",
  "/admin/user-profile/edit/",
  "/report/daybook",
  "/report/party-statement",
]

const accountantAllowRotues = [
  "/admin/dashboard",
  "/report/daybook",
  "/report/party-statement"
];



const SideNav = () => {
  const userData = useSelector((store) => store.userDetail);
  const { pathname: activePath } = useLocation();
  const [salesOpen, setSalesOpen] = useState(false);
  const [purshaseOpen, setPurshaseOpen] = useState(false);
  const isAdmin = !userData?.role || userData?.role === ROLE.ADMIN;

  const canSee = (link) => {
    const role = userData?.role;

    if (isAdmin) return true;
    else if (role == ROLE.SALES)
      return salesAllowLinks.some(allowed => link.startsWith(allowed));
    else if (role == ROLE.ACCOUNTANT)
      return accountantAllowRotues.some(allowed => link.startsWith(allowed));
    else if (role === ROLE.MANAGER)
      return !managerNotAllowLinks.some(allowed => link.startsWith(allowed));
  };

  useEffect(() => {
    if (salesPath.includes(activePath)) {
      setSalesOpen(true);
    } else if (purshasePath.includes(activePath)) {
      setPurshaseOpen(true);
    }
  }, [activePath]);

  return (
    <aside className='side__nav min-w-[175px] h-[calc(100vh-50px)] bg-[#003e32] text-white' id='sideBar'>
      <div className="side__nav__logo flex justify-center items-center"></div>
      <div className="side__nav__links pb-3">

        {/* Main Links */}
        <div className="side__nav__link__group">
          <ul>
            {links.main.map((link, index) => {
              // Hide Assigned Party for admin
              if (isAdmin && link.link === "/admin/assigned-party") {
                return null;
              }

              return (
                canSee(link.link) && (
                  <li
                    key={index}
                    className={`flex items-center ${link.link === activePath ? 'active__link' : ''}`}
                  >
                    <Link
                      to={link.link}
                      data-tooltip-id="sideBarItemToolTip"
                      className="flex items-center w-full"
                    >
                      <span className="mr-3">{link.icon}</span>
                      <span>{link.name}</span>
                    </Link>
                  </li>
                )
              );
            })}
          </ul>
        </div>

        {/* Users */}
        {canSee("/admin/user-profile") && (
          <div className="side__nav__link__group">
            <ul>
              <li className={`flex items-center ${"/admin/user-profile" === activePath ? 'active__link' : ''}`}>
                <Link to={'/admin/user-profile'} data-tooltip-id="sideBarItemToolTip" className="flex items-center w-full">
                  <span className='mr-3'><Icons.USERS /></span>
                  <span>Users</span>
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Sales */}
        {links.sales.some(l => canSee(l.link)) && (
          <div className="side__nav__link__group">
            <h3
              onClick={() => setSalesOpen(!salesOpen)}
              className='text-[16px] my-3 flex items-center justify-between cursor-pointer'>
              Sales
              <span className='mr-1'>
                {salesOpen ? <Icons.MENU_DOWN_ARROW className='text-[14px]' /> : <Icons.MENU_UP_ARROW className='text-[14px]' />}
              </span>
            </h3>
            {salesOpen && (
              <ul className='bg-slate-700'>
                {links.sales.map((link, index) => (
                  canSee(link.link) && (
                    <li key={index} className={`flex items-center ${activePath.search(link.link) >= 0 ? 'active__link' : ''}`}>
                      <Link to={link.link} data-tooltip-id="sideBarItemToolTip" className="flex items-center w-full">
                        <span className='mr-3'>{link.icon}</span>
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  )
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Purchase */}
        {links.Purshase.some(l => canSee(l.link)) && (
          <div className="side__nav__link__group">
            <h3
              onClick={() => setPurshaseOpen(!purshaseOpen)}
              className='text-[16px] my-3 flex items-center justify-between cursor-pointer'>
              Purshase
              <span className='mr-1'>
                {purshaseOpen ? <Icons.MENU_DOWN_ARROW className='text-[14px]' /> : <Icons.MENU_UP_ARROW className='text-[14px]' />}
              </span>
            </h3>
            {purshaseOpen && (
              <ul className='bg-slate-700'>
                {links.Purshase.map((link, index) => (
                  canSee(link.link) && (
                    <li key={index} className={`flex items-center ${activePath.search(link.link) >= 0 ? 'active__link' : ''}`}>
                      <Link to={link.link} data-tooltip-id="sideBarItemToolTip" className="flex items-center w-full">
                        <span className='mr-3'>{link.icon}</span>
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  )
                ))}
              </ul>
            )}
          </div>
        )}


        {/* Accounting Solution */}
        {links.Accounting.some(l => canSee(l.link)) && (
          <div className="side__nav__link__group">
            <h3 className='text-[16px] my-5'>Accounting Solution</h3>
            <ul>
              {links.Accounting.map((link, index) => (
                canSee(link.link) && (
                  <li key={index} className={`flex items-center ${activePath.search(link.link) >= 0 ? 'active__link' : ''}`}>
                    <Link to={link.link} data-tooltip-id="sideBarItemToolTip" className="flex items-center w-full">
                      <span className='mr-3'>{link.icon}</span>
                      <span>{link.name}</span>
                    </Link>
                  </li>
                )
              ))}
            </ul>
          </div>
        )}

        {/* Report */}
        {links.Report.some(l => canSee(l.link)) && (
          <div className="side__nav__link__group">
            <h3 className='text-[16px] my-5'>Report</h3>
            <ul>
              {links.Report.map((link, index) => (
                canSee(link.link) && (
                  <li key={index} className={`flex items-center ${activePath.search(link.link) >= 0 ? 'active__link' : ''}`}>
                    <Link to={link.link} data-tooltip-id="sideBarItemToolTip" className="flex items-center w-full">
                      <span className='mr-3'>{link.icon}</span>
                      <span>{link.name}</span>
                    </Link>
                  </li>
                )
              ))}
            </ul>
          </div>
        )}

        {/* Setup */}
        {(canSee("/admin/site") || canSee("/admin/unit") || canSee("/admin/tax") || canSee("/admin/item-category")) && (
          <div className="side__nav__link__group">
            <h3 className='text-[16px] my-5'>Setup</h3>
            <ul>
              {canSee("/admin/site") && (
                <li className={`flex items-center ${activePath.search("/admin/site") >= 0 ? 'active__link' : ''}`}>
                  <Link to={"/admin/site"} data-tooltip-id="sideBarItemToolTip" className="flex items-center w-full">
                    <span className='mr-3'><Icons.SETTING /></span>
                    <span>Site/Business Settings</span>
                  </Link>
                </li>
              )}
              {canSee("/admin/unit") && (
                <li className={`flex items-center ${activePath.search("/admin/unit") >= 0 ? 'active__link' : ''}`}>
                  <Link to={"/admin/unit"} data-tooltip-id="sideBarItemToolTip" className="flex items-center w-full">
                    <span className='mr-3'><Icons.UNITS /></span>
                    <span>Unit</span>
                  </Link>
                </li>
              )}
              {canSee("/admin/tax") && (
                <li className={`flex items-center ${activePath.search("/admin/tax") >= 0 ? 'active__link' : ''}`}>
                  <Link to={"/admin/tax"} data-tooltip-id="sideBarItemToolTip" className="flex items-center w-full">
                    <span className='mr-3'><Icons.TAXES /></span>
                    <span>Tax</span>
                  </Link>
                </li>
              )}
              {canSee("/admin/item-category") && (
                <li className={`flex items-center ${activePath.search("/admin/item-category") >= 0 ? 'active__link' : ''}`}>
                  <Link to={"/admin/item-category"} data-tooltip-id="sideBarItemToolTip" className="flex items-center w-full">
                    <span className='mr-3'><Icons.CATEGORY /></span>
                    <span>Category</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}

      </div>
      <Tooltip id='sideBarItemToolTip' className='z-50' />
    </aside>
  );
};

export default SideNav;
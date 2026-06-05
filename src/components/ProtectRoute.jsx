import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';
import useMyToaster from '../hooks/useMyToaster';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';


const ROLE = {
    ADMIN: 'admin',
    SALES: 'sales',
    MANAGER: 'manager',
    ACCOUNTANT: 'accountant'
};
const ProtectRoute = ({ children }) => {
    const { pathname } = useLocation();
    const toast = useMyToaster();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const userData = useSelector(state => state.userDetail);


    // Sales person Access this routes;
    const nonAdminRoutes = [
        "/admin/bill/details/",
        "/admin/dashboard",
        "/admin/profile",
        "/admin/assigned-party",
        "/admin/party/details/",

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

    // Manager not access this routes;
    const managerRoutes = [
        "/admin/account",
        "/admin/account/add",
        "/admin/account/edit/",
        "/admin/other-transaction/add",
        "/admin/other-transaction/edit",
        "/admin/other-transaction",
        "/admin/balance-sheet",
        "/admin/assigned-party",
        "/admin/user-profile",
        "/admin/user-profile/edit",
        "/report/daybook",
        "/report/party-statement",
    ];

    // Accountant Access this routes;
    const accountantRotues = [
        "/admin/dashboard",
        "/report/daybook",
        "/report/party-statement",
        "/admin/profile",
    ];



    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) {
            navigate("/admin")
            return toast("You need to login first", "error")
        }

        const checkToken = async () => {
            try {
                const url = process.env.REACT_APP_API_URL + "/user/check-token";
                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token })
                });

                const res = await req.json();
                if (req.status === 500 || res.err) {
                    navigate("/admin");
                    return toast(res.err, "error");
                }

                setLoading(false)

            } catch (error) {
                console.log(error)
                navigate("/admin");
                return toast("Something went wrong", "error")
            }
        }


        // =======================[ROLE BASED ACCESSED]=======================
        // ===================================================================
        let role = userData.role;
        if (role && role !== ROLE.ADMIN && role === ROLE.SALES) {
            if (!nonAdminRoutes.some(route => pathname.includes(route))) {
                return navigate("/notfound");
            }
        }
        else if (role && role !== ROLE.ADMIN && role === ROLE.ACCOUNTANT) {
            if (!accountantRotues.some(route => pathname.includes(route))) {
                return navigate("/notfound");
            }
        }
        else if (role && role !== ROLE.ADMIN && role === ROLE.MANAGER) {
            if (managerRoutes.some(route => pathname.includes(route))) {
                return navigate("/notfound");
            }
        }


        checkToken();
    }, [navigate, toast, userData])


    if (userData?.companies?.length < 1) {
        if (window.location.pathname !== "/admin/company" && window.location.pathname !== "/admin/profile") {
            toast("You need to create a company first", "warning")
            navigate("/admin/company");

        }
    }

    return (
        <>
            {loading ? <p></p> : children}
        </>
    )
}




const UnProtectRoute = ({ children }) => {
    const token = Cookies.get("token");
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = async () => {
            try {
                const url = process.env.REACT_APP_API_URL + "/user/check-token";
                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token })
                });

                const res = await req.json();
                if (req.status === 200 || !res.err) {
                    navigate("/admin/dashboard");
                }

            } catch (error) {
                console.log("[*Error]", error)
                // navigate("/admin");
            }
        }

        checkToken();

    }, [token])

    return (
        <>
            {children}
        </>
    )
}

export { ProtectRoute, UnProtectRoute };


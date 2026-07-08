import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Nav from "../components/Nav";
import SideNav from "../components/SideNav";
import AdminDashboard from "./Dashboard/AdminDashboard";
import SalesDashboard from "./Dashboard/SalesDashboard";
import ManagerDashboard from "./Dashboard/ManagerDashboard";
import AccountantDashboard from "./Dashboard/AccountantDashboard";

const ROLE = {
	ADMIN: "admin",
	SALES: "sales",
	MANAGER: "manager",
	ACCOUNTANT: "accountant",
};
const Dashboard = () => {
	const userData = useSelector((store) => store.userDetail);


	return (
		<>
			<Nav title={"Dashboard"} />
			<main id="main">
				<SideNav />
				{userData.role === ROLE.ADMIN && <AdminDashboard />}
				{userData.role === ROLE.SALES && <SalesDashboard />}
				{userData.role === ROLE.MANAGER && <ManagerDashboard />}
				{userData.role === ROLE.ACCOUNTANT && <AccountantDashboard />}
			</main>
		</>
	)
};

export default Dashboard;
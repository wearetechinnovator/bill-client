import { useEffect, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Popover, Whisper } from 'rsuite';
import { BiPrinter } from "react-icons/bi";
import { FaRegCopy, FaRegEdit } from "react-icons/fa";
import { FaRegFilePdf } from "react-icons/fa";
import { FaRegFileExcel } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import { IoIosAdd, IoMdMore } from 'react-icons/io';
import AddNew from '../../components/AddNew';
import { FiMoreHorizontal } from 'react-icons/fi';
import { Icons } from '../../helper/icons';
import useTopLoading from '../../hooks/useTopLoadingBar';




const DEBOUNCE_TIME = 300;
const UserProfile = () => {
	const token = Cookies.get("token")
	const toast = useMyToaster();
	const navigate = useNavigate();
	const [userData, setUserData] = useState([]);
	const [loading, setLoading] = useState(true);
	const { TopLoadingBar, setTopLoading } = useTopLoading();



	// Get data;
	useEffect(() => {
		(async () => {
			try {
				setTopLoading(30);
				setLoading(true);
				const URL = `${process.env.REACT_APP_API_URL}/user/get-all`;
				const req = await fetch(URL, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ token })
				});
				setTopLoading(70);
				const res = await req.json();
				if (req.status !== 200) {
					return toast(res.err, "error");
				}
				setUserData([...res])
				setTopLoading(100);

			} catch (error) {
				return toast("Something went wrong", "error");
			} finally {
				setLoading(false);
			}
		})()
	}, [])


	return (
		<>
			{TopLoadingBar}
			<Nav title={"User Profile"} />
			<main id='main'>
				<SideNav />
				<Tooltip id='accoutnTooltip' />
				<div className='content__body'>
					{
						!loading ? <div className='content__body__main view'>
							{/* Table start */}
							<div className='overflow-x-auto list__table'>
								<table className='min-w-full bg-white' id='listQuotation'>
									<thead className='list__table__head'>
										<tr>
											<th align='left' className='py-2'>Name</th>
											<th align='left'>Role</th>
											<th align='left'>Email</th>
											<th>Status</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{
											userData.map((data, i) => {
												return <tr key={i}>
													<td align='left' className='py-2 w-[30%]'>{data.name}</td>
													<td align='left' className='w-[20%] capitalize'>{data.role}</td>
													<td align='left' className='w-[30%]'>{data.email}</td>
													<td align='center' className='w-[30%]'>
														{
															data.isDisable ? (
																<span className='badge red-badge'>Inactive</span>
															) : (
																<span className='badge green-badge'>Active</span>
															)
														}
													</td>
													<td>
														<Whisper
															placement='leftStart'
															trigger={"click"}
															speaker={<Popover full>
																<div
																	className='table__list__action__icon'
																	onClick={() => navigate(`/admin/user-profile/edit/${data._id}`)}
																>
																	<FaRegEdit className='text-[16px]' />
																	Edit
																</div>
															</Popover>}
														>
															<div className='table__list__action' >
																<FiMoreHorizontal />
															</div>
														</Whisper>
													</td>
												</tr>
											})
										}
									</tbody>
								</table>
							</div>
						</div>
							: <DataShimmer />
					}
				</div>
			</main>

		</>
	)
}

export default UserProfile;
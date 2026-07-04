import { useCallback, useEffect, useState } from 'react';
import { SelectPicker, Button } from 'rsuite';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdCurrencyRupee } from "react-icons/md";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { FaRegCheckCircle } from "react-icons/fa";
import { BiReset } from "react-icons/bi";
import useMyToaster from '../../hooks/useMyToaster';
import useApi from '../../hooks/useApi';
import useBillPrefix from '../../hooks/useBillPrefix';
import Cookies from 'js-cookie';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import swal from 'sweetalert';
import AddPartyModal from '../../components/AddPartyModal';
import AddItemModal from '../../components/AddItemModal';
import MySelect2 from '../../components/MySelect2';
import { Icons } from '../../helper/icons';
import useFormHandle from '../../hooks/useFormHandle';
import Loading from '../../components/Loading';





const AddPoClient = ({ mode }) => {
    const token = Cookies.get("token");
    const getPartyModalState = useSelector((store) => store.partyModalSlice.show);
    const getItemModalState = useSelector((store) => store.itemModalSlice.show);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useMyToaster();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const { getApiData } = useApi();
    const itemRowSet = {
        QuotaionItem: 1, itemName: '', description: '', hsn: '', qun: '1',
        unit: [], selectedUnit: '', price: '', discountPerAmount: '', discountPerPercentage: '',
        tax: '', taxAmount: '', amount: '', perDiscountType: "", //for checking purpose only
    }
    const [ItemRows, setItemRows] = useState([itemRowSet]);
    const [formData, setFormData] = useState({
        party: '', poNumber: '', poDate: new Date().toISOString().split('T')[0], items: ItemRows,
        driveLink: '', enqNumber: '',
    })

    const [perPrice, setPerPrice] = useState(null);
    const [perTax, setPerTax] = useState(null);
    const [perDiscount, setPerDiscount] = useState(null);
    const [perQun, setPerQun] = useState(null);
    const [allOpenEnquiry, setAllOpenEnquiry] = useState([]);

    // Store all items without filter
    const [items, setItems] = useState([]);
    const [unit, setUnit] = useState([]);
    const [tax, setTax] = useState([]);
    const [party, setParty] = useState([]);


    // store item label and value pair for dropdown
    const [itemData, setItemData] = useState([])
    const [taxData, setTaxData] = useState([]);

    // Form hook
    const {
        onItemChange, addItem, deleteItem,
        changeDiscountType, calculateFinalAmount
    } = useFormHandle();


    // Get data for update mode;
    useEffect(() => {
        if (id) {
            (async () => {
                const URL = process.env.REACT_APP_API_URL + "/po-client/get";
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token, id: id })
                })
                const res = await req.json();
                setFormData({
                    ...formData, ...res.data,
                    poDate: res.data.poDate
                        ? new Date(res.data.poDate).toISOString().split("T")[0]
                        : "",
                });
                setItemRows([...res.data.items]);
            })()
        }
    }, [id])


    // Get all data from api
    useState(() => {
        const apiData = async () => {
            {
                const data = await getApiData("item");
                setItems([...data.data]);

                const newItemData = data.data.map(d => ({ label: d.title, value: d.title }));
                setItemData(newItemData);
            }
            {
                const data = await getApiData("unit");
                const unit = data.data.map(d => ({ label: d.title, value: d.title }));
                setUnit([...unit]);
            }
            {
                const data = await getApiData("tax");
                const tax = data.data.map(d => ({ label: d.title, value: d.gst }));
                setTax([...data.data]);
                setTaxData([...tax]);
            }
            {
                const data = await getApiData("party");
                const party = data.data.map(d => ({ label: d.name, value: d._id }));
                setParty([...party]);
            }
        }

        apiData();

    }, [])


    // Get all open enquiry;
    useEffect(() => {
        (async () => {
            if (!formData.party) return;

            try {
                const URL = process.env.REACT_APP_API_URL + "/enquiry/get-enquiry-by-party";
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token, partyId: formData.party?._id || formData.party })
                })
                const res = await req.json();
                if (req.status !== 200 || res.err) {
                    return toast(res.err, "error");
                }

                setAllOpenEnquiry(res.data);

            } catch (err) {
                return toast("Enquires not fetch", "error");
            }
        })()
    }, [formData.party])

    const onPerDiscountAmountChange = (val, index) => {
        let item = [...ItemRows];
        let amount = parseFloat(item[index].price) * parseFloat(item[index].qun);
        let percentage = ((parseFloat(val) / amount) * 100).toFixed(2);

        if (item[index].perDiscountType !== "percentage" || formData.discountType === "before") {
            item[index].discountPerAmount = isNaN(val) || val === 0 ? (0).toFixed(2) : val;
            item[index].discountPerPercentage = isNaN(percentage) ? (0).toFixed(2) : percentage;
        }
        setItemRows(item);

    }

    const onPerDiscountPercentageChange = (val, index) => {
        let item = [...ItemRows];
        let amount = parseFloat(item[index].price) * parseFloat(item[index].qun);
        // let percentage = (parseFloat(val) / amount) * 100;
        let dis_amount = amount / 100 * val

        if (item[index].perDiscountType !== "amount" || formData.discountType === "before") {
            item[index].discountPerPercentage = val;
            item[index].discountPerAmount = (dis_amount).toFixed(2);
        }
        setItemRows(item);

    }

    const calculatePerTaxAmount = (index) => {
        const tax = ItemRows[index].tax / 100;
        const qun = ItemRows[index].qun;
        const price = ItemRows[index].price;
        const disAmount = ItemRows[index].discountPerAmount;
        const amount = ((qun * price) - disAmount);
        const taxamount = (amount * tax).toFixed(2);

        return taxamount;
    }

    const calculatePerAmount = (index) => {
        const qun = ItemRows[index].qun;
        const price = ItemRows[index].price;
        const disAmount = ItemRows[index].discountPerAmount;
        const totalPerAmount = parseFloat((qun * price) - disAmount) + parseFloat(calculatePerTaxAmount(index));

        return (totalPerAmount).toFixed(2);
    }

    // *Save bill
    const saveBill = async () => {
        if (formData.party === "") {
            return toast("Please select party", "error")
        } else if (formData.enqNumber === "") {
            return toast("Please Select Enquiry", "error")
        } else if (formData.poNumber === "") {
            return toast("Please enter purchase order number", "error")
        } else if (formData.poDate === "") {
            return toast("Please select purchase order date", "error")
        } else if (formData.driveLink === "") {
            return toast("Please enter your drive link", "error")
        }

        for (let row of ItemRows) {
            if (row.itemName === "") {
                return toast("Please select item", "error")
            } else if (row.qun === "") {
                return toast("Please enter quantity", "error")
            } else if (row.unit === "") {
                return toast("Please select unit", "error")
            } else if (row.price === "") {
                return toast("Please enter price", "error")
            }
        }

        // Add Per Item Tax and Amound before save
        ItemRows.forEach((row, index) => {
            row.taxAmount = calculatePerTaxAmount(index);
            row.amount = calculatePerAmount(index);
        });
        setItemRows([...ItemRows]);

        try {
            setLoading(true);
            let URL;
            if (mode)
                URL = process.env.REACT_APP_API_URL + "/po-client/update";
            else
                URL = process.env.REACT_APP_API_URL + "/po-client/add";

            const req = await fetch(URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(!mode ? { ...formData, token } : { ...formData, token, id: id })
            })
            const res = await req.json();
            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            if (mode) {
                return toast('PO update successfully', 'success');
            }

            clearForm();

            toast('PO add successfully', 'success');
            navigate('/admin/po-client');
            return;
        } catch (error) {
            return toast('Something went wrong', 'error')
        } finally {
            setLoading(false);
        }
    }


    // *Clear form values;
    const clearForm = () => {
        setItemRows([itemRowSet]);
        setFormData({
            party: '', poNumber: '', poDate: '', items: ItemRows,
            discountType: '', discountAmount: '', discountPercentage: '',
        });

    }


    return (
        <>
            <Nav title={mode ? "Update PO" : "Add PO"} />
            <main id='main'>
                <SideNav />
                <AddPartyModal open={getPartyModalState} />
                <AddItemModal open={getItemModalState} />

                <div className='content__body'>
                    <div className='content__body__main bg-white' id='addQuotationTable'>
                        <div className='flex flex-col lg:flex-row items-center justify-around gap-4'>
                            <div className='flex flex-col gap-2 w-full'>
                                <p className='text-xs'>Select Party <span className='required__text'>*</span></p>
                                <MySelect2
                                    model={"party"}
                                    partyType={"supplier"}
                                    onType={(v) => {
                                        setFormData({ ...formData, party: v })
                                    }}
                                    value={formData.party?._id}
                                />
                            </div>
                            <div className='flex flex-col gap-2 w-full lg:w-1/3'>
                                <p className='text-xs'>Select Enquiry No.
                                    <span className='required__text'>*</span>
                                </p>
                                <SelectPicker
                                    data={allOpenEnquiry.map(e => ({ label: e.enqNo, value: e.enqNo }))}
                                    onChange={(v) => setFormData({ ...formData, enqNumber: v })}
                                    value={formData.enqNumber}
                                />
                            </div>
                            <div className='flex flex-col gap-2 w-full lg:w-1/3'>
                                <p className='text-xs'>PO Number <span className='required__text'>*</span></p>
                                <input type="text"
                                    onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                                    value={formData.poNumber}
                                />
                            </div>
                            <div className='flex flex-col gap-2 w-full lg:w-1/3'>
                                <p className='text-xs'>PO Date <span className='required__text'>*</span></p>
                                <input type="date"
                                    className='text-xs'
                                    onChange={(e) => {
                                        setFormData({ ...formData, poDate: e.target.value })
                                    }}
                                    value={formData.poDate}
                                />
                            </div>
                            <div className='flex flex-col gap-2 w-full lg:w-1/3'>
                                <p className='text-xs'>Upload PO File Source <span className='required__text'>*</span></p>
                                <input type="text"
                                    className='text-xs'
                                    onChange={(e) => {
                                        setFormData({ ...formData, driveLink: e.target.value })
                                    }}
                                    value={formData.driveLink}
                                />
                            </div>
                        </div>

                        <div className='overflow-x-auto rounded'>
                            <table className='add__table min-w-full table-style'>
                                <thead >
                                    <tr>
                                        <th style={{ "width": "*" }}>Item</th>
                                        <th style={{ "width": "6%" }}>HSN/SAC</th>
                                        <th style={{ "width": "5%" }}>QTY</th>
                                        <th style={{ "width": "7%" }}>Unit</th>
                                        <th style={{ "width": "10%" }}>Price/Item</th>
                                        <th style={{ "width": "10%" }}>Tax</th>
                                        <th style={{ "width": "10%" }}>Amount</th>
                                        <th style={{ "width": "3%" }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ItemRows.map((i, index) => (
                                        <tr key={i.QuotaionItem} className='border-b'>
                                            {/* Item name and description */}
                                            <td>
                                                <div className='flex flex-col gap-2'>
                                                    <MySelect2
                                                        model={"item"}
                                                        onType={(v) => {
                                                            if (v === ItemRows[index].itemId) return;
                                                            onItemChange(v, index, tax, ItemRows, setItemRows, setItems)
                                                        }}
                                                        value={ItemRows[index].itemId}
                                                    />
                                                    <input type='text' className='input-style' placeholder='Description'
                                                        onChange={(e) => {
                                                            let item = [...ItemRows];
                                                            item[index].description = e.target.value;
                                                            setItemRows(item);
                                                        }}
                                                        value={ItemRows[index].description}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <input type='text' className='w-[70px] input-style'
                                                    onChange={(e) => {
                                                        let item = [...ItemRows];
                                                        item[index].hsn = e.target.value;
                                                        setItemRows(item);
                                                    }}
                                                    value={ItemRows[index].hsn}
                                                />
                                            </td>
                                            <td>
                                                <input type='text' className='input-style'
                                                    onChange={(e) => {
                                                        let item = [...ItemRows];
                                                        item[index].qun = e.target.value;
                                                        setItemRows(item);
                                                        setPerQun(e.target.value);
                                                        if (formData.discountType !== "before") {
                                                        }
                                                        onPerDiscountPercentageChange(formData.items[index].discountPerPercentage, index);
                                                        onPerDiscountAmountChange(formData.items[index].discountPerAmount, index);
                                                    }}
                                                    value={ItemRows[index].qun}
                                                />
                                            </td>
                                            <td>
                                                <select className='input-style'
                                                    onChange={(e) => {
                                                        let item = [...ItemRows];
                                                        item[index].selectedUnit = e.target.value;
                                                        setItemRows(item);
                                                    }}
                                                    value={ItemRows[index].selectedUnit}
                                                >
                                                    {
                                                        ItemRows[index].unit.map((u, _) => {
                                                            return <option key={_} value={u}>{u}</option>
                                                        })
                                                    }
                                                </select>
                                            </td>
                                            <td align='center'>
                                                <div>
                                                    <input type='text' className='input-style'
                                                        onChange={(e) => {
                                                            let item = [...ItemRows];
                                                            item[index].price = e.target.value;
                                                            setItemRows(item);
                                                            setPerPrice(e.target.value);
                                                            if (formData.discountType !== "before") {
                                                            }
                                                            onPerDiscountPercentageChange(formData.items[index].discountPerPercentage, index);
                                                            onPerDiscountAmountChange(formData.items[index].discountPerAmount, index);
                                                        }}
                                                        value={ItemRows[index].price}
                                                    />
                                                </div>
                                            </td>
                                            <td> {/** Tax and Taxamount */}
                                                <div className='flex flex-col gap-2'>
                                                    <SelectPicker
                                                        onChange={(v) => {
                                                            let item = [...ItemRows];
                                                            item[index].tax = v;
                                                            setItemRows(item);
                                                            setPerTax('')
                                                        }}
                                                        value={ItemRows[index].tax}
                                                        data={taxData}
                                                    />
                                                    <input type="text"
                                                        onChange={(e) => {
                                                            let item = [...ItemRows];
                                                            item[index].taxAmount = e.target.value;
                                                            setItemRows(item);
                                                        }}
                                                        value={calculatePerTaxAmount(index)}
                                                    />
                                                </div>
                                            </td>
                                            <td align='center'>
                                                <div>
                                                    <input type="text"
                                                        value={calculatePerAmount(index)}
                                                        className='bg-gray-100 custom-disabled'
                                                        disabled
                                                    />
                                                </div>
                                            </td>
                                            <td align='center' className='w-[20px]'>
                                                <RiDeleteBin6Line
                                                    className='cursor-pointer text-[16px]'
                                                    onClick={() => ItemRows.length > 1 && deleteItem(1, index, setItemRows, setFormData, () => { })}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={9}>
                                            <Button color='blue' className='float-right w-full font-bold' onClick={() => addItem(1, itemRowSet, setItemRows, setFormData, {}, () => { })}>
                                                <MdOutlinePlaylistAdd className='text-lg mr-1' />
                                                Add Item
                                            </Button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>{/* Content Body Main Close */}

                    <div className='form-btn-bar'>
                        <button
                            onClick={loading ? null : saveBill}
                            className='add-bill-btn'>
                            {loading ? <Loading /> : <Icons.CHECK />}
                            {!mode ? "Save" : "Update"}
                        </button>
                        <button className='reset-bill-btn' onClick={clearForm}>
                            <Icons.RESET />
                            Reset
                        </button>
                    </div>
                </div>{/* Content Body Close */}
            </main>
        </>
    )
}

export default AddPoClient;

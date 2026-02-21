import { useEffect, useState } from 'react';
import { Modal } from 'rsuite';
import useMyToaster from '../hooks/useMyToaster';
import Cookies from 'js-cookie';
import { Icons } from '../helper/icons';

const TransactionCategoryManageModal = () => {
    const token = Cookies.get('token');
    const toast = useMyToaster();
    const [formData, setFormData] = useState({ categoryName: '' });
    const [categoryData, setCategoryData] = useState([]);




    // Get Categories
    useEffect(() => {
        (async () => {
            try {
                const URL = `${process.env.REACT_APP_API_URL}/transaction-category/get`;
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token })
                })
                const res = await req.json();

                if (req.status !== 200) {
                    return toast(res.err, 'error');
                }

                setCategoryData(res.data);

            } catch (error) {
                console.log(error)
                return toast("Something went wrong", "error");
            }
        })()
    }, [])


    const addCategory = async () => {
        if (formData.categoryName === "")
            return toast("Enter Category Name", 'error');


        try {
            const URL = `${process.env.REACT_APP_API_URL}/transaction-category/add`;
            const req = await fetch(URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token, categoryName: formData.categoryName })
            })
            const res = await req.json();

            if (req.status !== 200) {
                return toast(res.err, 'error');
            }

            setCategoryData(prev => [...prev, res]);
            setFormData({ categoryName: '' });

        } catch (error) {
            return toast("Something went wrong", "error");
        }
    }


    const deleteCategory = async (id) => {
        try {
            const URL = `${process.env.REACT_APP_API_URL}/transaction-category/delete`;
            const req = await fetch(URL, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id })
            })
            const res = await req.json();
            if (req.status !== 200) {
                return toast(res.err, 'error');
            }

            setCategoryData(prev => prev.filter(c => c._id !== id));
            return toast(res.msg, 'success');

        } catch (err) {
            console.log(err);
            return toast("Something went wrong", "error");
        }
    }

    const editCategory = async (id) => {
        try {
            const URL = `${process.env.REACT_APP_API_URL}/transaction-category/add`;
            const req = await fetch(URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id, update: true,
                    categoryName: formData.categoryName, token
                })
            })
            const res = await req.json();
            if (req.status !== 200) {
                return toast(res.err, 'error');
            }

            setCategoryData(prev => prev.map(c => c._id === id ? res : c));
            setFormData({ categoryName: '' });
            return toast("Category updated successfully", 'success');

        } catch (err) {
            return toast("Something went wrong", "error");
        }
    }

    return (
        <Modal open={true} onClose={() => { }} size='md' backdrop='static'>
            <Modal.Header className='border-b pb-2'>
                <Modal.Title>
                </Modal.Title>
                <p className='font-bold'>Add / Manage Category</p>
            </Modal.Header>
            <Modal.Body>
                <div className='w-full bg-gray-50 rounded border p-2 sticky top-0'>
                    <input type="text"
                        className='text-xs'
                        placeholder='Enter Category name'
                        onChange={(e) => setFormData({ categoryName: e.target.value })}
                        value={formData.categoryName}
                    />
                    <button
                        onClick={addCategory}
                        className='text-xs px-2 py-1 rounded mt-2 bg-blue-400 text-white'
                    >
                        Add Category
                    </button>
                </div>


                <div className='w-full flex flex-col gap-2 mt-4'>
                    {
                        categoryData.map((c, i) => {
                            return <div key={i} className='w-full flex items-center justify-between p-2 border-b'>
                                <p className='text-sm'>{c.categoryName}</p>
                                <div className='flex items-center gap-2'>
                                    <button className='border hover:border-blue-400 text-[17px] p-1 rounded'>
                                        <Icons.PENCIL className='text-blue-500' />
                                    </button>
                                    <button
                                        onClick={() => deleteCategory(c._id)}
                                        className='border hover:border-red-400 text-[17px] p-1 rounded'>
                                        <Icons.DELETE className=' text-red-500' />
                                    </button>
                                </div>
                            </div>
                        })
                    }

                </div>
            </Modal.Body>
        </Modal>
    )
}

export default TransactionCategoryManageModal;
import { useEffect, useState } from "react";
import { Modal } from "rsuite"
import { Icons } from "../helper/icons";


const ConfirmModal = ({ openConfirm, openStatus, title, isDel = true, fun }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(openConfirm)
    }, [openConfirm])

    return (
        <Modal
            className="confirm__modal"
            open={open}
            onClose={() => {
                setOpen(false);
                openStatus(false);
            }}
            size={"xs"}
            centered={true}
        >
            <Modal.Body>
                <div className="flex items-start">
                    <Icons.WARNING className="text-xl"/>
                    <span className="text-[17px]">Confirmation</span>
                </div>
                <p className="title text-xs">{title}</p>
                <div className="mt-7 text-end">
                    <button className="cancel" onClick={() => {
                        setOpen(false);
                        openStatus(false);
                    }}>
                        Cancel
                    </button>
                    <button className="yes" onClick={() => fun && fun()}>
                        Yes{isDel && ", Delete"}
                    </button>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default ConfirmModal;
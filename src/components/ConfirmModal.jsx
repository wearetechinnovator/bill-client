import { useEffect, useState } from "react";
import { Modal } from "rsuite"


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
                <p className="title">{title}</p>
                <div className="mt-5 text-end">
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
import { Message, useToaster } from 'rsuite';

const useToast = () => {
  const toaster = useToaster();

  const showToast = (type = 'info', message) => {
    toaster.push(
      <Message showIcon type={type} closable>
        {message}
      </Message>, { placement: 'bottomEnd', duration: 2000 }
    )
  };

  return showToast;
};

export default useToast;

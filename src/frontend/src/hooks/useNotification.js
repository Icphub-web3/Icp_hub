import Notification from '../components/ui/Notification';

function useNotification() {
  const showNotification = ({ type, title, message, duration = 4000 }) => {
    const notificationContainer = document.getElementById('notification-root');
    if (!notificationContainer) return;

    const notificationElement = document.createElement('div');
    notificationContainer.appendChild(notificationElement);

    const removeNotification = () => {
      if (notificationElement) {
        notificationContainer.removeChild(notificationElement);
      }
    };

    const renderNotification = () => {
      ReactDOM.render(
        <Notification
          type={type}
          title={title}
          message={message}
          onDismiss={removeNotification}
        />,
        notificationElement
      );
    };

    renderNotification();

    setTimeout(() => {
      removeNotification();
    }, duration);
  };

  return showNotification;
}

export default useNotification;

// src/components/Toast.jsx
function Toast({ message }) {
    return (
        <div id="toast" className={message ? 'show' : ''}>
            {message}
        </div>
    );
}
export default Toast;
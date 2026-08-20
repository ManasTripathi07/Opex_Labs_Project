import './Loading.css';

function Loading({ message = 'Loading...', size = 'md' }) {
  return (
    <div className={`loading loading-${size}`}>
      <div className="loading-spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}

export default Loading;

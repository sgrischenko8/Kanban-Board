import Spinner from 'react-bootstrap/Spinner';

export const Loader = () => {
  return (
    <div className="position-absolute w-100 h-100 bg-secondary bg-opacity-10">
      <Spinner
        animation="border"
        role="status"
        variant="primary"
        className="position-absolute top-50 start-50"
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

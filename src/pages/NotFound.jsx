import { useNavigate } from 'react-router-dom';
import { Empty } from '../components/ui.jsx';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="panel">
      <Empty
        title="Page not found"
        text="The page you requested does not exist."
        action={(
          <button className="primary" onClick={() => navigate('/')}>
            Back to overview
          </button>
        )}
      />
    </section>
  );
}

export default NotFoundPage;

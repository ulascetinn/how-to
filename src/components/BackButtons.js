import { useNavigate } from 'react-router-dom';

export default function BackButtons() {
    const navigate = useNavigate();

    return (
        <div className="back-buttons">
            <button onClick={() => navigate(-1)}>Back</button>
            <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
    );
}

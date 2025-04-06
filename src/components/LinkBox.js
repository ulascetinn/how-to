// src/components/LinkBox.js
import { Link } from 'react-router-dom';

export default function LinkBox({ to, label }) {
    return (
        <div className="link-box">
            <Link to={to}>{label}</Link>
        </div>
    );
}

import Header from '../components/Header';
import BackButtons from '../components/BackButtons';
import { Link } from 'react-router-dom';

export default function Calculator() {
    return (
        <>
            <Header />
            <div className="container">
                <div className="calculator">
                    <Link to="/calculator/flow-rate">Flow Rate Calculator</Link>
                </div>
                <div className="calculator">
                    <Link to="/calculator/flow-speed">Flow Speed Calculator</Link>
                </div>
                <div className="calculator">
                    <Link to="/calculator/pressure-loss">Pressure Loss Calculator</Link>
                </div>
                <div className="calculator">
                    <Link to="/calculator/other">Other</Link>
                </div>
            </div>
            <BackButtons />
        </>
    );
}

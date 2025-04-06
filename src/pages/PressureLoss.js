import Header from '../components/Header';
import BackButtons from '../components/BackButtons';
import { useState } from 'react';

export default function PressureLoss() {
    const [velocity, setVelocity] = useState('');
    const [zeta, setZeta] = useState('');
    const [unit, setUnit] = useState('0.00001');
    const [result, setResult] = useState('');

    const calculatePressureLoss = () => {
        const v = parseFloat(velocity);
        const z = parseFloat(zeta);
        const factor = parseFloat(unit);

        if (isNaN(v) || v <= 0 || isNaN(z) || z <= 0) {
            setResult('Please enter valid velocity and zeta.');
            return;
        }

        const pressureLossPa = 0.5 * 998.2 * v ** 2 * z;
        const pressureLoss = pressureLossPa * factor;

        setResult(`Pressure Loss: ${pressureLoss.toFixed(6)}`);
    };

    return (
        <>
            <Header />
            <div className="container">
                <input type="number" placeholder="Velocity (m/s)" value={velocity} onChange={(e) => { setVelocity(e.target.value); calculatePressureLoss(); }} />
                <input type="number" placeholder="Zeta (ζ)" value={zeta} onChange={(e) => { setZeta(e.target.value); calculatePressureLoss(); }} />
                <select value={unit} onChange={(e) => { setUnit(e.target.value); calculatePressureLoss(); }}>
                    <option value="0.00001">bar</option>
                    <option value="0.10197">mWc</option>
                    <option value="0.001">kPa</option>
                    <option value="0.000145038">psi</option>
                </select>
                <div>{result}</div>
            </div>
            <BackButtons />
        </>
    );
}

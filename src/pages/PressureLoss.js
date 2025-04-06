import Header from '../components/Header';
import BackButtons from '../components/BackButtons';
import { useState, useEffect } from 'react';

export default function PressureLoss() {
    const [velocity, setVelocity] = useState('');
    const [zeta, setZeta] = useState('');
    const [unit, setUnit] = useState('0.000001'); // Default is MPa (1 Pa = 1e-6 MPa)
    const [result, setResult] = useState('');

    useEffect(() => {
        const v = parseFloat(velocity);
        const z = parseFloat(zeta);
        const factor = parseFloat(unit);

        if (isNaN(v) || v <= 0 || isNaN(z) || z <= 0) {
            setResult('');
            return;
        }

        // Calculate pressure loss in Pascals using the formula
        const pressureLossPa = 0.5 * 998.2 * v ** 2 * z;
        // Convert the pressure loss from Pa to the selected unit
        const pressureLoss = pressureLossPa * factor;

        setResult(`Pressure Loss: ${pressureLoss.toFixed(6)}`);
    }, [velocity, zeta, unit]);

    return (
        <>
            <Header />
            <div className="container">
                <div>
                    <label htmlFor="velocity">Velocity (m/s)</label>
                    <input
                        id="velocity"
                        type="number"
                        value={velocity}
                        onChange={(e) => setVelocity(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="zeta">Zeta (ζ)</label>
                    <input
                        id="zeta"
                        type="number"
                        value={zeta}
                        onChange={(e) => setZeta(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="unit">Unit</label>
                    <select id="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                        <option value="0.000001">MPa</option>
                        <option value="0.00001">bar</option>
                        <option value="0.000102">mWc</option>
                        <option value="0.001">kPa</option>
                        <option value="0.000145038">psi</option>
                    </select>
                </div>
                <div>{result}</div>
            </div>
            <BackButtons />
        </>
    );
}

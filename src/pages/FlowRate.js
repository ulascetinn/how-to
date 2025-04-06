import Header from '../components/Header';
import BackButtons from '../components/BackButtons';
import { useState, useEffect } from 'react';

export default function FlowRate() {
    const [flowVelocity, setFlowVelocity] = useState('');
    const [dn, setDn] = useState('');
    const [unit, setUnit] = useState('1');
    const [result, setResult] = useState('');

    useEffect(() => {
        const velocity = parseFloat(flowVelocity);
        const diameter = parseFloat(dn);
        const unitFactor = parseFloat(unit);

        if (isNaN(velocity) || isNaN(diameter) || diameter <= 0) {
            setResult('');
            return;
        }

        // Convert DN from mm to meters
        const dnMeters = diameter / 1000;
        // Calculate the cross-sectional area (m²)
        const area = Math.PI * Math.pow(dnMeters / 2, 2);
        // Calculate flow rate in m³/s (velocity * area)
        const flowRateM3s = velocity * area;
        // Convert to the selected unit
        const flowRateConverted = flowRateM3s * unitFactor;

        setResult(`Flow Rate: ${flowRateConverted.toFixed(6)}`);
    }, [flowVelocity, dn, unit]);

    return (
        <>
            <Header />
            <div className="container">
                <input
                    type="number"
                    placeholder="Flow Velocity (m/s)"
                    value={flowVelocity}
                    onChange={(e) => setFlowVelocity(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="DN (mm)"
                    value={dn}
                    onChange={(e) => setDn(e.target.value)}
                />
                <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                    <option value="1">m³/s</option>
                    <option value="1000">L/s</option>
                    <option value="3600">m³/h</option>
                    <option value="60000">L/min</option>
                    <option value="86.4">ML/d</option>
                </select>
                <div>{result}</div>
            </div>
            <BackButtons />
        </>
    );
}

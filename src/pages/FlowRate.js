import Header from '../components/Header';
import BackButtons from '../components/BackButtons';
import { useState, useEffect } from 'react';

export default function FlowRate() {
    const [dn, setDn] = useState('');
    const [flowVelocity, setFlowVelocity] = useState('');
    const [unit, setUnit] = useState('1');
    const [result, setResult] = useState('');

    useEffect(() => {
        const diameter = parseFloat(dn);
        const velocity = parseFloat(flowVelocity);
        const unitFactor = parseFloat(unit);

        if (isNaN(velocity) || isNaN(diameter) || diameter <= 0) {
            setResult('');
            return;
        }

        // Convert DN from mm to meters
        const dnMeters = diameter / 1000;
        // Calculate the cross-sectional area of the pipe (m²)
        const area = Math.PI * Math.pow(dnMeters / 2, 2);
        // Calculate flow rate in m³/s using: Q = velocity * area
        const flowRateM3s = velocity * area;
        // Apply the unit conversion factor
        const flowRateConverted = flowRateM3s * unitFactor;

        setResult(`Flow Rate: ${flowRateConverted.toFixed(6)}`);
    }, [dn, flowVelocity, unit]);

    return (
        <>
            <Header />
            <div className="container">
                <div>
                    <label htmlFor="dn">DN (mm)</label>
                    <input
                        id="dn"
                        type="number"
                        value={dn}
                        onChange={(e) => setDn(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="flowVelocity">Flow Velocity (m/s)</label>
                    <input
                        id="flowVelocity"
                        type="number"
                        placeholder="Flow Velocity (m/s)"
                        value={flowVelocity}
                        onChange={(e) => setFlowVelocity(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="unit">Unit</label>
                    <select id="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                        <option value="1">m³/s</option>
                        <option value="1000">L/s</option>
                        <option value="3600">m³/h</option>
                        <option value="60000">L/min</option>
                        <option value="86.4">ML/d</option>
                    </select>
                </div>
                <div>{result}</div>
            </div>
            <BackButtons />
        </>
    );
}

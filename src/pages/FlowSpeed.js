import Header from '../components/Header';
import BackButtons from '../components/BackButtons';
import { useState, useEffect } from 'react';

export default function FlowSpeed() {
    const [dn, setDn] = useState('');
    const [flowRate, setFlowRate] = useState('');
    const [unit, setUnit] = useState('1');
    const [result, setResult] = useState('');

    useEffect(() => {
        const diameter = parseFloat(dn);
        const rate = parseFloat(flowRate);
        const unitFactor = parseFloat(unit);

        if (isNaN(diameter) || diameter <= 0 || isNaN(rate) || rate <= 0) {
            setResult('');
            return;
        }

        // Convert the flow rate to m³/s based on the selected unit
        const rateM3s = rate * unitFactor;
        // Calculate the pipe's cross-sectional area: A = π * (d/2)²
        // Rearranged to solve for velocity: v = Q / A
        const speed = rateM3s / (Math.PI * Math.pow(diameter / 1000, 2) / 4);

        setResult(`Flow Speed: ${speed.toFixed(3)} m/s`);
    }, [dn, flowRate, unit]);

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
                    <label htmlFor="flowRate">Flow Rate</label>
                    <input
                        id="flowRate"
                        type="number"
                        placeholder="Flow Rate"
                        value={flowRate}
                        onChange={(e) => setFlowRate(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="unit">Unit</label>
                    <select
                        id="unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                    >
                        <option value="1">m³/s</option>
                        <option value="0.001">L/s</option>
                        <option value="0.000277778">m³/h</option>
                        <option value="0.000016667">L/min</option>
                    </select>
                </div>
                <div>{result}</div>
            </div>
            <BackButtons />
        </>
    );
}

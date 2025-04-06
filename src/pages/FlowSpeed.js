import Header from '../components/Header';
import BackButtons from '../components/BackButtons';
import { useState } from 'react';

export default function FlowSpeed() {
    const [dn, setDn] = useState('');
    const [flowRate, setFlowRate] = useState('');
    const [unit, setUnit] = useState('1');
    const [result, setResult] = useState('');

    const calculateSpeed = () => {
        const diameter = parseFloat(dn);
        const rate = parseFloat(flowRate);
        const unitFactor = parseFloat(unit);

        if (isNaN(diameter) || diameter <= 0 || isNaN(rate) || rate <= 0) {
            setResult('Please enter valid DN and flow rate.');
            return;
        }

        const rateM3s = rate * unitFactor;
        const speed = rateM3s / (Math.PI * (diameter / 1000) ** 2 / 4);

        setResult(`Flow Speed: ${speed.toFixed(3)} m/s`);
    };

    return (
        <>
            <Header />
            <div className="container">
                <input type="number" placeholder="DN (mm)" value={dn} onChange={(e) => { setDn(e.target.value); calculateSpeed(); }} />
                <input type="number" placeholder="Flow Rate" value={flowRate} onChange={(e) => { setFlowRate(e.target.value); calculateSpeed(); }} />
                <select value={unit} onChange={(e) => { setUnit(e.target.value); calculateSpeed(); }}>
                    <option value="1">m³/s</option>
                    <option value="0.001">L/s</option>
                    <option value="0.000277778">m³/h</option>
                    <option value="0.06">L/min</option>
                </select>
                <div>{result}</div>
            </div>
            <BackButtons />
        </>
    );
}

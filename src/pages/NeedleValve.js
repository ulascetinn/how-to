import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BackButtons from '../components/BackButtons';
import { flowRateUnits, pressureUnits, convertFlowRate } from '../utils/units';
import zetas from '../utils/zetaData';
import '../index.css';

// Initial state for a single case column
const initialCaseState = {
    flowRate: '',
    velocity: '',
    inlet: '25.00',
    outlet: '16.00',
    dP: '9.00',
    slotlessOpening: '',
    slottedOpening: ''
};

const NeedleValve = () => {
    // State for top-level inputs
    const [pipelineDN, setPipelineDN] = useState('1520');
    const [valveDN, setValveDN] = useState('1200');
    const [valvePN, setValvePN] = useState('16');

    // State for the three cases
    const [caseA, setCaseA] = useState({ ...initialCaseState, flowRate: '240.00' });
    const [caseB, setCaseB] = useState({ ...initialCaseState, flowRate: '48.00' });
    const [caseC, setCaseC] = useState({ ...initialCaseState, flowRate: '170.00' });

    // State for units
    const [flowRateUnit, setFlowRateUnit] = useState('l/s');
    const [pressureUnit, setPressureUnit] = useState('bar');

    // This useEffect hook recalculates velocity and dP automatically.
    useEffect(() => {
        // Helper function to calculate velocity based on flow rate and valve diameter.
        const calculateVelocity = (flowRate, currentUnit, valveDiameter) => {
            const flow = parseFloat(flowRate);
            const dn = parseFloat(valveDiameter);

            if (isNaN(flow) || isNaN(dn) || dn <= 0) {
                return '';
            }

            // Convert flow rate to m³/s for calculation.
            const flowInM3s = convertFlowRate(flow, currentUnit, 'm3/s');
            // Calculate the cross-sectional area of the valve in m².
            const area = Math.PI * Math.pow(dn / 1000 / 2, 2);

            if (area === 0) return '';

            const velocity = flowInM3s / area;
            return velocity.toFixed(2); // Return velocity rounded to 2 decimal places.
        };

        // Helper function to calculate the pressure difference (ΔP).
        const calculateDp = (inlet, outlet) => {
            const p_in = parseFloat(inlet);
            const p_out = parseFloat(outlet);
            if (!isNaN(p_in) && !isNaN(p_out)) {
                return (p_in - p_out).toFixed(2);
            }
            return '';
        };

        // Update each case with new calculations.
        setCaseA(prev => ({
            ...prev,
            velocity: calculateVelocity(prev.flowRate, flowRateUnit, valveDN),
            dP: calculateDp(prev.inlet, prev.outlet)
        }));
        setCaseB(prev => ({
            ...prev,
            velocity: calculateVelocity(prev.flowRate, flowRateUnit, valveDN),
            dP: calculateDp(prev.inlet, prev.outlet)
        }));
        setCaseC(prev => ({
            ...prev,
            velocity: calculateVelocity(prev.flowRate, flowRateUnit, valveDN),
            dP: calculateDp(prev.inlet, prev.outlet)
        }));

    }, [
        valveDN,
        flowRateUnit,
        caseA.flowRate, caseB.flowRate, caseC.flowRate,
        caseA.inlet, caseA.outlet,
        caseB.inlet, caseB.outlet,
        caseC.inlet, caseC.outlet
    ]);


    const handleCaseChange = (caseSetter, field, value) => {
        caseSetter(prev => ({ ...prev, [field]: value }));
    };

    // This function performs the main calculation for valve openings.
    const handleCalculateClick = () => {
        const calculateZeta = (velocity, dP) => {
            const vel = parseFloat(velocity);
            const deltaP = parseFloat(dP);
            // Return null if inputs are invalid to prevent calculation errors.
            if (isNaN(vel) || isNaN(deltaP) || vel === 0) {
                return null;
            }
            // Assuming water density is approx. 998.2 kg/m³. dP is in bar.
            // Formula: zeta = (ΔP * 100000 Pa/bar) / (0.5 * density * v^2)
            const zeta = (deltaP * 100000) / (0.5 * 998.2 * Math.pow(vel, 2));
            return zeta;
        };

        // Finds the opening range for a given zeta value.
        const findOpeningRange = (zeta, dataTable) => {
            if (zeta === null || !dataTable || dataTable.length === 0) {
                return "Invalid Input";
            }

            // Since zeta is inversely correlated with opening, a higher zeta means a lower opening.
            // We look for the point where the calculated zeta fits between two points in our data.
            for (let i = 0; i < dataTable.length - 1; i++) {
                const lowerBound = dataTable[i + 1];
                const upperBound = dataTable[i];
                // Check if zeta falls between the current and next data points.
                if (zeta <= upperBound.zeta && zeta > lowerBound.zeta) {
                    // Return the corresponding opening range.
                    return `${lowerBound.opening}-${upperBound.opening}%`;
                }
            }

            // Handle edge cases.
            if (dataTable.length > 1 && zeta > dataTable[1].zeta) {
                return `< ${dataTable[1].opening}%`; // If zeta is very high
            }
            if (zeta <= dataTable[dataTable.length - 1].zeta) {
                return `≥ ${dataTable[dataTable.length - 1].opening}%`; // If zeta is very low
            }

            return "Out of Range";
        };

        // Helper to process each case
        const processCase = (caseData) => {
            const zeta = calculateZeta(caseData.velocity, caseData.dP);
            return {
                slotlessOpening: findOpeningRange(zeta, zetas.zetaDataSlotless),
                slottedOpening: findOpeningRange(zeta, zetas.zetaDataSlotted),
            };
        };

        setCaseA(prev => ({ ...prev, ...processCase(prev) }));
        setCaseB(prev => ({ ...prev, ...processCase(prev) }));
        setCaseC(prev => ({ ...prev, ...processCase(prev) }));
    };

    return (
        <div>
            <Header />
            <div className="container">
                <h1>Needle Valve Opening Calculator</h1>

                <div className="input-section">
                    <h2>Initial Parameters</h2>
                    <div className="needle-valve-inputs">
                        <div>
                            <label>Pipeline DN</label>
                            <input type="number" value={pipelineDN} onChange={(e) => setPipelineDN(e.target.value)} className="input-themed" />
                            <span>mm</span>
                        </div>
                        <div>
                            <label>Valve DN</label>
                            <input type="number" value={valveDN} onChange={(e) => setValveDN(e.target.value)} className="input-themed" />
                            <span>mm</span>
                        </div>
                        <div>
                            <label>Valve PN</label>
                            <input type="number" value={valvePN} onChange={(e) => setValvePN(e.target.value)} className="input-themed" />
                            <span>bar</span>
                        </div>
                    </div>
                </div>

                <div className="input-section">
                    <h2>Case Scenarios</h2>
                    <table className="needle-valve-table">
                        <thead>
                            <tr>
                                <th>CALCULATE</th>
                                <th>Case A</th>
                                <th>Case B</th>
                                <th>Case C</th>
                                <th>Units</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Flow Rate</td>
                                <td><input type="number" value={caseA.flowRate} onChange={(e) => handleCaseChange(setCaseA, 'flowRate', e.target.value)} className="input-themed" /></td>
                                <td><input type="number" value={caseB.flowRate} onChange={(e) => handleCaseChange(setCaseB, 'flowRate', e.target.value)} className="input-themed" /></td>
                                <td><input type="number" value={caseC.flowRate} onChange={(e) => handleCaseChange(setCaseC, 'flowRate', e.target.value)} className="input-themed" /></td>
                                <td>
                                    <select value={flowRateUnit} onChange={(e) => setFlowRateUnit(e.target.value)}>
                                        {Object.keys(flowRateUnits).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>Flow Rate (m³/h)</td>
                                <td>{(convertFlowRate(caseA.flowRate, flowRateUnit, 'm3/h')).toFixed(3)}</td>
                                <td>{(convertFlowRate(caseB.flowRate, flowRateUnit, 'm3/h')).toFixed(3)}</td>
                                <td>{(convertFlowRate(caseC.flowRate, flowRateUnit, 'm3/h')).toFixed(3)}</td>
                                <td>m³/h</td>
                            </tr>
                            <tr>
                                <td>Velocity</td>
                                <td>{caseA.velocity}</td>
                                <td>{caseB.velocity}</td>
                                <td>{caseC.velocity}</td>
                                <td>m/s</td>
                            </tr>
                            <tr>
                                <td>Inlet Pressure</td>
                                <td><input type="number" value={caseA.inlet} onChange={(e) => handleCaseChange(setCaseA, 'inlet', e.target.value)} className="input-themed" /></td>
                                <td><input type="number" value={caseB.inlet} onChange={(e) => handleCaseChange(setCaseB, 'inlet', e.target.value)} className="input-themed" /></td>
                                <td><input type="number" value={caseC.inlet} onChange={(e) => handleCaseChange(setCaseC, 'inlet', e.target.value)} className="input-themed" /></td>
                                <td rowSpan="3">
                                    <select value={pressureUnit} onChange={(e) => setPressureUnit(e.target.value)}>
                                        {Object.keys(pressureUnits).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>Outlet Pressure</td>
                                <td><input type="number" value={caseA.outlet} onChange={(e) => handleCaseChange(setCaseA, 'outlet', e.target.value)} className="input-themed" /></td>
                                <td><input type="number" value={caseB.outlet} onChange={(e) => handleCaseChange(setCaseB, 'outlet', e.target.value)} className="input-themed" /></td>
                                <td><input type="number" value={caseC.outlet} onChange={(e) => handleCaseChange(setCaseC, 'outlet', e.target.value)} className="input-themed" /></td>
                            </tr>
                            <tr>
                                <td>&Delta;P</td>
                                <td>{caseA.dP}</td>
                                <td>{caseB.dP}</td>
                                <td>{caseC.dP}</td>
                            </tr>
                            <tr className="result-row-good">
                                <td>Opening w/o slotter</td>
                                <td>{caseA.slotlessOpening}</td>
                                <td>{caseB.slotlessOpening}</td>
                                <td>{caseC.slotlessOpening}</td>
                                <td>%</td>
                            </tr>
                            <tr className="result-row-good">
                                <td>Opening w/ slotter</td>
                                <td>{caseA.slottedOpening}</td>
                                <td>{caseB.slottedOpening}</td>
                                <td>{caseC.slottedOpening}</td>
                                <td>%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <button onClick={handleCalculateClick} style={{ marginTop: '20px' }}>
                    Calculate Openings
                </button>
            </div>
            <BackButtons />
        </div>
    );
};

export default NeedleValve;

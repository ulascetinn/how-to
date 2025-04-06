import Header from '../components/Header';
import BackButtons from '../components/BackButtons';
import { useState } from 'react';

export default function Other() {
    const [selectedFunction, setSelectedFunction] = useState('zeta');

    // Zeta conversion: zeta(delta_p, velocity)
    const [zeta_deltaP, setZeta_deltaP] = useState('');
    const [zeta_velocity, setZeta_velocity] = useState('');

    // ΔP from Zeta conversion: dp_by_zeta(zeta, velocity)
    const [dp_zeta, setDp_zeta] = useState('');
    const [dp_velocity, setDp_velocity] = useState('');

    // Reynolds Number conversion: reynolds_number(dn, velocity, temperature)
    const [rn_dn, setRn_dn] = useState('');
    const [rn_velocity, setRn_velocity] = useState('');
    const [rn_temperature, setRn_temperature] = useState('');

    // Needle Torque conversion: needle_torque(r1, r2, pn, stroke)
    const [nt_r1, setNt_r1] = useState('');
    const [nt_r2, setNt_r2] = useState('');
    const [nt_pn, setNt_pn] = useState('');
    const [nt_stroke, setNt_stroke] = useState('');

    // Gamma conversion: gamma(p1, p2, k)
    const [gamma_p1, setGamma_p1] = useState('');
    const [gamma_p2, setGamma_p2] = useState('');
    const [gamma_k, setGamma_k] = useState('');

    // Air Valve Theory conversion: air_valve_theory(dn, p1, p2)
    const [avt_dn, setAvt_dn] = useState('');
    const [avt_p1, setAvt_p1] = useState('');
    const [avt_p2, setAvt_p2] = useState('');

    const [result, setResult] = useState('');

    // Conversion functions (ported from Python)

    // zeta: zeta = delta_p * 2e5 / (velocity^2 * water_density)
    const computeZeta = (deltaP, velocity) => {
        return (deltaP * 2e5) / (velocity * velocity * 998.2);
    };

    // dp_by_zeta: ΔP = zeta * velocity^2 * water_density / 2e5
    const computeDpByZeta = (zetaVal, velocity) => {
        return (zetaVal * velocity * velocity * 998.2) / (2e5);
    };

    // Reynolds Number: re = (dn/1000)*velocity*density/dynamic_viscosity
    // Here we use density = 998.2 kg/m³ and dynamic viscosity ≈ 0.001 Pa.s
    const computeReynoldsNumber = (dn, velocity, temperature) => {
        return (dn / 1000) * velocity * 998.2 / 0.001;
    };

    // Helper area function: area = (π * (diameter/1000)^2)/4
    const area = (diameter) => {
        const dm = diameter / 1000;
        return (Math.PI * dm * dm) / 4;
    };

    // Needle Torque: pressure_area = area(2*r2) - area(2*r1)
    // torque = pressure_area * pn * 1e5 * stroke * 1e-3
    const computeNeedleTorque = (r1, r2, pn, stroke) => {
        const pressureArea = area(2 * r2) - area(2 * r1);
        return pressureArea * pn * 1e5 * stroke * 1e-3;
    };

    // Gamma: gamma = sqrt((p2/p1)^(2/k) - (p2/p1)^((k+1)/k))
    const computeGamma = (p1, p2, k) => {
        if (p1 === 0) return NaN;
        const ratio = p2 / p1;
        return Math.sqrt(Math.pow(ratio, 2 / k) - Math.pow(ratio, (k + 1) / k));
    };

    // Air Valve Theory: flow_rate = dn * 756.5 * gamma(p1, p2)
    const computeAirValveTheory = (dn, p1, p2) => {
        return dn * 756.5 * computeGamma(p1, p2, 1.4);
    };

    const calculateResult = () => {
        let res = '';
        switch (selectedFunction) {
            case 'zeta': {
                const deltaP = parseFloat(zeta_deltaP);
                const velocity = parseFloat(zeta_velocity);
                if (isNaN(deltaP) || deltaP <= 0 || isNaN(velocity) || velocity <= 0) {
                    res = 'Please enter valid ΔP and velocity.';
                } else {
                    const val = computeZeta(deltaP, velocity);
                    res = `Zeta: ${val.toFixed(6)}`;
                }
                break;
            }
            case 'dpByZeta': {
                const zetaVal = parseFloat(dp_zeta);
                const velocity = parseFloat(dp_velocity);
                if (isNaN(zetaVal) || isNaN(velocity) || velocity <= 0) {
                    res = 'Please enter valid zeta and velocity.';
                } else {
                    const val = computeDpByZeta(zetaVal, velocity);
                    res = `ΔP from Zeta: ${val.toFixed(6)} bar`;
                }
                break;
            }
            case 'reynoldsNumber': {
                const dn = parseFloat(rn_dn);
                const velocity = parseFloat(rn_velocity);
                const temp = parseFloat(rn_temperature);
                if (isNaN(dn) || dn <= 0 || isNaN(velocity) || velocity <= 0 || isNaN(temp)) {
                    res = 'Please enter valid DN, velocity, and temperature.';
                } else {
                    const val = computeReynoldsNumber(dn, velocity, temp);
                    res = `Reynolds Number: ${val.toFixed(0)}`;
                }
                break;
            }
            case 'needleTorque': {
                const r1 = parseFloat(nt_r1);
                const r2 = parseFloat(nt_r2);
                const pn = parseFloat(nt_pn);
                const stroke = parseFloat(nt_stroke);
                if (isNaN(r1) || isNaN(r2) || isNaN(pn) || isNaN(stroke) || r1 < 0 || r2 <= 0 || pn <= 0 || stroke <= 0) {
                    res = 'Please enter valid values for r1, r2, PN, and stroke.';
                } else {
                    const val = computeNeedleTorque(r1, r2, pn, stroke);
                    res = `Needle Torque: ${val.toFixed(6)} N.m`;
                }
                break;
            }
            case 'gamma': {
                const p1 = parseFloat(gamma_p1);
                const p2 = parseFloat(gamma_p2);
                const k = parseFloat(gamma_k);
                if (isNaN(p1) || p1 <= 0 || isNaN(p2) || isNaN(k) || k <= 0) {
                    res = 'Please enter valid p1, p2, and k.';
                } else {
                    const val = computeGamma(p1, p2, k);
                    res = `Gamma: ${val.toFixed(6)}`;
                }
                break;
            }
            case 'airValveTheory': {
                const dn = parseFloat(avt_dn);
                const p1 = parseFloat(avt_p1);
                const p2 = parseFloat(avt_p2);
                if (isNaN(dn) || dn <= 0 || isNaN(p1) || p1 <= 0 || isNaN(p2) || p2 < 0) {
                    res = 'Please enter valid DN, p1, and p2.';
                } else {
                    const val = computeAirValveTheory(dn, p1, p2);
                    res = `Air Valve Theory Flow: ${val.toFixed(6)}`;
                }
                break;
            }
            default:
                res = '';
        }
        setResult(res);
    };

    const renderInputs = () => {
        switch (selectedFunction) {
            case 'zeta':
                return (
                    <>
                        <div>
                            <label htmlFor="zeta_deltaP">ΔP (bar)</label>
                            <input
                                id="zeta_deltaP"
                                type="number"
                                value={zeta_deltaP}
                                onChange={(e) => setZeta_deltaP(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="zeta_velocity">Velocity (m/s)</label>
                            <input
                                id="zeta_velocity"
                                type="number"
                                value={zeta_velocity}
                                onChange={(e) => setZeta_velocity(e.target.value)}
                            />
                        </div>
                    </>
                );
            case 'dpByZeta':
                return (
                    <>
                        <div>
                            <label htmlFor="dp_zeta">Zeta</label>
                            <input
                                id="dp_zeta"
                                type="number"
                                value={dp_zeta}
                                onChange={(e) => setDp_zeta(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="dp_velocity">Velocity (m/s)</label>
                            <input
                                id="dp_velocity"
                                type="number"
                                value={dp_velocity}
                                onChange={(e) => setDp_velocity(e.target.value)}
                            />
                        </div>
                    </>
                );
            case 'reynoldsNumber':
                return (
                    <>
                        <div>
                            <label htmlFor="rn_dn">DN (mm)</label>
                            <input
                                id="rn_dn"
                                type="number"
                                value={rn_dn}
                                onChange={(e) => setRn_dn(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="rn_velocity">Velocity (m/s)</label>
                            <input
                                id="rn_velocity"
                                type="number"
                                value={rn_velocity}
                                onChange={(e) => setRn_velocity(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="rn_temperature">Temperature (°C)</label>
                            <input
                                id="rn_temperature"
                                type="number"
                                value={rn_temperature}
                                onChange={(e) => setRn_temperature(e.target.value)}
                            />
                        </div>
                    </>
                );
            case 'needleTorque':
                return (
                    <>
                        <div>
                            <label htmlFor="nt_r1">r1 (mm)</label>
                            <input
                                id="nt_r1"
                                type="number"
                                value={nt_r1}
                                onChange={(e) => setNt_r1(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="nt_r2">r2 (mm)</label>
                            <input
                                id="nt_r2"
                                type="number"
                                value={nt_r2}
                                onChange={(e) => setNt_r2(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="nt_pn">PN (bar)</label>
                            <input
                                id="nt_pn"
                                type="number"
                                value={nt_pn}
                                onChange={(e) => setNt_pn(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="nt_stroke">Stroke (mm)</label>
                            <input
                                id="nt_stroke"
                                type="number"
                                value={nt_stroke}
                                onChange={(e) => setNt_stroke(e.target.value)}
                            />
                        </div>
                    </>
                );
            case 'gamma':
                return (
                    <>
                        <div>
                            <label htmlFor="gamma_p1">p1 (bar)</label>
                            <input
                                id="gamma_p1"
                                type="number"
                                value={gamma_p1}
                                onChange={(e) => setGamma_p1(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="gamma_p2">p2 (bar)</label>
                            <input
                                id="gamma_p2"
                                type="number"
                                value={gamma_p2}
                                onChange={(e) => setGamma_p2(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="gamma_k">k (default 1.4)</label>
                            <input
                                id="gamma_k"
                                type="number"
                                value={gamma_k}
                                onChange={(e) => setGamma_k(e.target.value)}
                            />
                        </div>
                    </>
                );
            case 'airValveTheory':
                return (
                    <>
                        <div>
                            <label htmlFor="avt_dn">DN (mm)</label>
                            <input
                                id="avt_dn"
                                type="number"
                                value={avt_dn}
                                onChange={(e) => setAvt_dn(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="avt_p1">p1 (bar)</label>
                            <input
                                id="avt_p1"
                                type="number"
                                value={avt_p1}
                                onChange={(e) => setAvt_p1(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="avt_p2">p2 (bar)</label>
                            <input
                                id="avt_p2"
                                type="number"
                                value={avt_p2}
                                onChange={(e) => setAvt_p2(e.target.value)}
                            />
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Header />
            <div className="container">
                <div>
                    <label htmlFor="functionSelect">Select Conversion Function</label>
                    <select
                        id="functionSelect"
                        value={selectedFunction}
                        onChange={(e) => {
                            setSelectedFunction(e.target.value);
                            setResult('');
                        }}
                    >
                        <option value="zeta">Zeta</option>
                        <option value="dpByZeta">ΔP from Zeta</option>
                        <option value="reynoldsNumber">Reynolds Number</option>
                        <option value="needleTorque">Needle Torque</option>
                        <option value="gamma">Gamma</option>
                        <option value="airValveTheory">Air Valve Theory</option>
                    </select>
                </div>
                {renderInputs()}
                <button onClick={calculateResult}>Calculate</button>
                <div>{result}</div>
            </div>
            <BackButtons />
        </>
    );
}

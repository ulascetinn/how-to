// This file contains utility functions and data for unit conversions.

// Conversion factors relative to a base unit.
// Base for flow rate: m^3/s
// Base for pressure: Pa

export const flowRateUnits = {
    'm3/s': 1,
    'l/s': 1000,
    'm3/h': 3600,
    'l/min': 60000,
    'ML/d': 86.4
};

export const pressureUnits = {
    'Pa': 1,
    'MPa': 0.000001,
    'bar': 0.00001,
    'mWc': 0.000102,
    'kPa': 0.001,
    'psi': 0.000145038,
};

/**
 * Converts a flow rate from one unit to another.
 * @param {number|string} value The numeric value to convert.
 * @param {string} fromUnit The unit to convert from (e.g., 'l/s').
 * @param {string} toUnit The unit to convert to (e.g., 'm3/h').
 * @returns {number} The converted value.
 */
export const convertFlowRate = (value, fromUnit, toUnit) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return 0;

    if (!flowRateUnits[fromUnit] || !flowRateUnits[toUnit]) {
        console.error("Invalid flow rate unit specified.");
        return numericValue;
    }

    // Convert 'from' unit to base unit (m^3/s)
    const valueInBase = numericValue / flowRateUnits[fromUnit];

    // Convert from base unit to 'to' unit
    return valueInBase * flowRateUnits[toUnit];
};

/**
 * Converts a pressure from one unit to another.
 * @param {number|string} value The numeric value to convert.
 * @param {string} fromUnit The unit to convert from (e.g., 'bar').
 * @param {string} toUnit The unit to convert to (e.g., 'psi').
 * @returns {number} The converted value.
 */
export const convertPressure = (value, fromUnit, toUnit) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return 0;

    if (!pressureUnits[fromUnit] || !pressureUnits[toUnit]) {
        console.error("Invalid pressure unit specified.");
        return numericValue;
    }

    // Convert 'from' unit to base unit (Pa)
    const valueInBase = numericValue / pressureUnits[fromUnit];

    // Convert from base unit to 'to' unit
    return valueInBase * pressureUnits[toUnit];
};

import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import BackButtons from '../components/BackButtons';
import * as XLSX from 'xlsx';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend,
} from 'chart.js';
import { arvBrand1, arvBrand2 } from '../utils/arvCapacities';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);

// Helper to process imported data: round numeric values (in Chainage and Elevation) to one decimal.
const processImportedData = (data) => {
    if (!data || data.length === 0) return data;
    const header = data[0];
    const processed = [header];
    // Assume Chainage is column 1 and Elevation is column 2.
    for (let i = 1; i < data.length; i++) {
        const row = data[i].slice(); // shallow copy
        [1, 2].forEach((col) => {
            let num = parseFloat(row[col]);
            if (!isNaN(num)) {
                row[col] = num.toFixed(1); // one decimal place as string
            }
        });
        processed.push(row);
    }
    return processed;
};

export default function AirReleaseValvePlacement() {
    const [tableData, setTableData] = useState([]);
    const [fillingSpeed, setFillingSpeed] = useState('');
    const [arvBrand, setArvBrand] = useState(''); // New state for ARV brand
    const [showGraph, setShowGraph] = useState(false);
    const [placementPoints, setPlacementPoints] = useState({ peaks: [], slopeChanges: [] });
    const fileInputRef = useRef(null);
    const chartRef = useRef(null);

    // On initial load, fetch the Excel file from public folder and limit to 10 rows.
    useEffect(() => {
        fetch("/ARV_Form.xlsx")
            .then((response) => response.arrayBuffer())
            .then((data) => {
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                // Process numeric values and limit to 10 rows initially.
                const processedData = processImportedData(jsonData);
                const totalRows = 10;
                if (processedData.length > totalRows) {
                    setTableData(processedData.slice(0, totalRows));
                } else if (processedData.length < totalRows) {
                    const header = processedData[0] || [];
                    const numColumns = header.length;
                    const additionalRows = Array.from({ length: totalRows - processedData.length }, () => Array(numColumns).fill(""));
                    setTableData([...processedData, ...additionalRows]);
                } else {
                    setTableData(processedData);
                }
            })
            .catch((error) => {
                console.error("Error fetching Excel file:", error);
                // Default data if fetch fails.
                const defaultData = [["Node", "Chainage", "Elevation", "ARV", "Project Title"]];
                defaultData.push(["", "", "", "", "Project Title"]);
                for (let i = 0; i < 8; i++) {
                    defaultData.push(["", "", "", "", ""]);
                }
                setTableData(defaultData);
            });
    }, []);

    // Update a specific cell in the table.
    const handleCellChange = (rowIndex, colIndex, value) => {
        const newData = [...tableData];
        newData[rowIndex][colIndex] = value;
        setTableData(newData);
    };

    // Download the Excel file from the public folder.
    const downloadExcel = () => {
        const link = document.createElement('a');
        link.href = "/ARV_Form.xlsx";
        link.download = "ARV_Form.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Clear table cells (except header) and hide graph, also clear the file input.
    const handleClear = () => {
        if (tableData.length > 0) {
            const header = tableData[0];
            const clearedRows = tableData.slice(1).map(row => row.map(() => ""));
            setTableData([header, ...clearedRows]);
        }
        setShowGraph(false);
        setPlacementPoints({ peaks: [], slopeChanges: [] });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // When Place is pressed, find high points and show the graph.
    const handlePlace = () => {
        const points = tableData.slice(2).map(row => ({
            chainage: parseFloat(row[1]),
            elevation: parseFloat(row[2])
        })).filter(p => !isNaN(p.chainage) && !isNaN(p.elevation));

        const peaks = [];
        const slopeChanges = [];

        for (let i = 1; i < points.length - 1; i++) {
            const prev = points[i - 1];
            const current = points[i];
            const next = points[i + 1];

            // Peak detection
            if (current.elevation > prev.elevation && current.elevation > next.elevation) {
                peaks.push(i);
                continue; // It's a peak, no need to check for slope change
            }

            // Slope change detection
            const slope1 = (current.elevation - prev.elevation) / (current.chainage - prev.chainage);
            const slope2 = (next.elevation - current.elevation) / (next.chainage - current.chainage);

            // Increased downslope
            if (slope1 < 0 && slope2 < 0 && Math.abs(slope2) > Math.abs(slope1)) {
                slopeChanges.push(i);
            }

            // Decreased upslope
            if (slope1 > 0 && slope2 > 0 && slope2 < slope1) {
                slopeChanges.push(i);
            }
        }
        setPlacementPoints({ peaks, slopeChanges });
        setShowGraph(true);
    };

    const handleSize = () => {
        if (!arvBrand) {
            alert("Please select an ARV brand.");
            return;
        }

        const pipelineDN = parseFloat(tableData[1][5]);
        if (isNaN(pipelineDN) || pipelineDN <= 0) {
            alert("Please enter a valid Pipeline DN.");
            return;
        }

        const safetyFactor = 1.1; // Safety factor for sizing
        const dnMeters = pipelineDN / 1000;
        const area = Math.PI * Math.pow(dnMeters / 2, 2);
        const requiredCapacity = parseFloat(fillingSpeed) * area * 3600 * safetyFactor; // in m^3/h

        const brandCapacities = arvBrand === 'Brand1' ? arvBrand1 : arvBrand2;

        const newData = [...tableData];
        const allPlacementIndices = [...placementPoints.peaks, ...placementPoints.slopeChanges];

        // First, reset all ARV cells to "-"
        for (let i = 2; i < newData.length; i++) {
            newData[i][3] = "-";
        }

        allPlacementIndices.forEach(index => {
            const suitableARV = brandCapacities.find(arv => arv.discharge1 >= requiredCapacity);
            if (suitableARV) {
                newData[index + 2][3] = `DN${suitableARV.DN}`;
            } else {
                newData[index + 2][3] = "No suitable ARV";
            }
        });

        setTableData(newData);
    };

    // Add 10 empty rows (each with 5 cells).
    const handleAddRows = () => {
        if (tableData.length > 0) {
            const header = tableData[0];
            const newRows = Array.from({ length: 10 }, () => Array(5).fill(""));
            setTableData([...tableData, ...newRows]);
        }
    };

    // When a file is uploaded, process and show all rows (no row limit).
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            setTableData(processImportedData(jsonData));
        };
        reader.readAsBinaryString(file);
    };

    // Compute graph data from tableData.
    const computeGraphData = () => {
        if (!tableData || tableData.length < 3) return { labels: [], datasets: [] };

        const validPoints = tableData.slice(2).map(row => ({
            chainage: parseFloat(row[1]),
            elevation: parseFloat(row[2]),
            node: row[0]
        })).filter(p => !isNaN(p.chainage) && !isNaN(p.elevation));

        const labels = validPoints.map(p => p.chainage);
        const dataPoints = validPoints.map(p => p.elevation);

        const peakData = placementPoints.peaks.map(index => ({
            x: validPoints[index].chainage,
            y: validPoints[index].elevation
        }));

        const slopeChangeData = placementPoints.slopeChanges.map(index => ({
            x: validPoints[index].chainage,
            y: validPoints[index].elevation
        }));

        return {
            labels,
            datasets: [
                {
                    label: 'Elevation',
                    data: dataPoints,
                    borderColor: 'green',
                    backgroundColor: 'green',
                    pointBackgroundColor: 'black',
                    fill: false,
                    tension: 0.1,
                },
                {
                    label: 'Peak',
                    data: peakData,
                    pointBackgroundColor: 'red',
                    pointRadius: 6,
                    pointStyle: 'circle',
                    showLine: false,
                    type: 'scatter'
                },
                {
                    label: 'Slope Change',
                    data: slopeChangeData,
                    pointBackgroundColor: 'blue',
                    pointRadius: 6,
                    pointStyle: 'rect',
                    showLine: false,
                    type: 'scatter'
                }
            ],
        };
    };

    // Render the table.
    const renderTable = () => {
        if (!tableData || tableData.length === 0) return <p>Loading data...</p>;
        const header = tableData[0];
        const headerLength = header.length;
        return (
            <table border="1">
                <thead>
                    <tr>
                        {header.map((cell, colIndex) => (
                            <th key={colIndex} style={colIndex < 4 ? { width: "max-content", whiteSpace: "nowrap" } : {}}>
                                {cell}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.slice(1).map((row, rowIndex) => {
                        const fullRow = row.length < headerLength ? [...row, ...Array(headerLength - row.length).fill("")] : row;
                        const editableAll = rowIndex === 0;
                        return (
                            <tr key={rowIndex}>
                                {fullRow.map((cell, colIndex) => {
                                    const cellStyle = colIndex < 4 ? { width: "max-content", whiteSpace: "nowrap" } : {};
                                    const editable = editableAll ? true : (colIndex < 4);
                                    return (
                                        <td key={colIndex} style={cellStyle}>
                                            {editable ? (
                                                <input
                                                    type="text"
                                                    value={cell}
                                                    onChange={(e) => handleCellChange(rowIndex + 1, colIndex, e.target.value)}
                                                />
                                            ) : (
                                                cell
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    // Graph options.
    const graphData = computeGraphData();
    const graphOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: tableData.length > 1 && tableData[1].length >= 5 ? tableData[1][4] : 'Project Title',
            },
            legend: {
                display: true
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const idx = context.dataIndex;
                        const validPoints = tableData.slice(2).map(row => ({
                            chainage: parseFloat(row[1]),
                            elevation: parseFloat(row[2]),
                            node: row[0]
                        })).filter(p => !isNaN(p.chainage) && !isNaN(p.elevation));

                        const point = validPoints[idx];
                        if (!point) return '';

                        const node = point.node ? point.node : "N/A";
                        const chainage = context.chart.data.labels[idx];
                        const elevation = context.parsed.y;
                        return `Node ${node} (${chainage}, ${elevation})`;
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Chainage',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Elevation',
                },
            },
        },
    };

    return (
        <>
            <Header />
            <div className="container">
                <h1>Air Release Valve Placement</h1>
                <div style={{ marginBottom: "1em", display: "flex", alignItems: "center", gap: "1em" }}>
                    <div>
                        <label htmlFor="fillingSpeed" title="AWWA 51">
                            Filling Speed (m/s):
                        </label>
                        <input
                            id="fillingSpeed"
                            type="number"
                            value={fillingSpeed}
                            onChange={(e) => setFillingSpeed(e.target.value)}
                            placeholder="Recommended: 0.3-0.6 m/s"
                            title="AWWA 51"
                        />
                    </div>
                    <div>
                        <label htmlFor="arvBrand">
                            ARV Brand:
                        </label>
                        <select
                            id="arvBrand"
                            value={arvBrand}
                            onChange={(e) => setArvBrand(e.target.value)}
                        >
                            <option value="">Choose ARV Brand</option>
                            <option value="Brand1">Brand1</option>
                            <option value="Brand2">Brand2</option>
                        </select>
                    </div>
                </div>
                {renderTable()}
                <div style={{ marginTop: "1em" }}>
                    <button onClick={downloadExcel}>Download Form</button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        style={{ marginLeft: "1em" }}
                    />
                </div>
                <div style={{ marginTop: "1em" }}>
                    <button onClick={handleClear}>Clear</button>
                    <button onClick={handlePlace} style={{ marginLeft: "1em" }}>
                        Place
                    </button>
                    <button onClick={handleSize} style={{ marginLeft: "1em" }}>
                        Size Filling
                    </button>
                    <button onClick={() => { /* Sizing algorithm will be here */ }} style={{ marginLeft: "1em" }}>
                        Size Vacuum
                    </button>
                    <button onClick={() => { /* Sizing algorithm will be here */ }} style={{ marginLeft: "1em" }}>
                        Size All
                    </button>
                    <button onClick={handleAddRows} style={{ marginLeft: "1em" }}>
                        Add 10 Rows
                    </button>
                </div>
                {showGraph && (
                    <div style={{ marginTop: "2em" }}>
                        <Line ref={chartRef} data={graphData} options={graphOptions} />
                    </div>
                )}
            </div>
            <BackButtons />
        </>
    );
}
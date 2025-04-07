import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import BackButtons from '../components/BackButtons';
import * as XLSX from 'xlsx';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend,
} from 'chart.js';

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
    const [fillingSpeed, setFillingSpeed] = useState('0.3');
    const [showGraph, setShowGraph] = useState(false);
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
                const defaultData = [["Node", "Chainage", "Elevation", "Project Title"]];
                defaultData.push(["", "", "", "Project Title"]);
                for (let i = 0; i < 8; i++) {
                    defaultData.push(["", "", "", ""]);
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
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // When Place is pressed, show the graph.
    const handlePlace = () => {
        setShowGraph(true);
    };

    // Add 10 empty rows (each with 4 cells).
    const handleAddRows = () => {
        if (tableData.length > 0) {
            const header = tableData[0];
            const newRows = Array.from({ length: 10 }, () => Array(4).fill(""));
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
    // Use x-axis from column 2 (Chainage) and y-axis from column 3 (Elevation)
    // Process rows starting at index 2 (i.e. skipping header and project title row).
    const computeGraphData = () => {
        if (!tableData || tableData.length < 3) return { labels: [], datasets: [] };
        const labels = [];
        const dataPoints = [];
        // Use rows from index 2 onward.
        for (let i = 2; i < tableData.length; i++) {
            const row = tableData[i];
            const chainage = parseFloat(row[1]);
            const elevation = parseFloat(row[2]);
            if (!isNaN(chainage) && !isNaN(elevation)) {
                labels.push(chainage);
                dataPoints.push(elevation);
            }
        }
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
            ],
        };
    };

    // Render the table.
    // • The header row (row index 0) is not editable.
    // • The first data row (row index 1) is fully editable (all 4 columns, including project title).
    // • Subsequent rows (row index ≥2) are editable only in the first 3 columns.
    const renderTable = () => {
        if (!tableData || tableData.length === 0) return <p>Loading data...</p>;
        const header = tableData[0];
        const headerLength = header.length;
        return (
            <table border="1">
                <thead>
                    <tr>
                        {header.map((cell, colIndex) => (
                            <th key={colIndex} style={colIndex < 3 ? { width: "max-content", whiteSpace: "nowrap" } : {}}>
                                {cell}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.slice(1).map((row, rowIndex) => {
                        const fullRow = row.length < headerLength ? [...row, ...Array(headerLength - row.length).fill("")] : row;
                        // For row index 0 in data (first data row): fully editable.
                        // For rows with index >=1: only columns 0,1,2 are editable.
                        const editableAll = rowIndex === 0;
                        return (
                            <tr key={rowIndex}>
                                {fullRow.map((cell, colIndex) => {
                                    const cellStyle = colIndex < 3 ? { width: "max-content", whiteSpace: "nowrap" } : {};
                                    const editable = editableAll ? true : (colIndex < 3);
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
    // The chart title is taken from the project title in row 1, column 4.
    // Tooltips display in the format: "Node X (Chainage, Elevation)"
    const graphData = computeGraphData();
    const graphOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: tableData.length > 1 && tableData[1].length >= 4 ? tableData[1][3] : 'Project Title',
            },
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const idx = context.dataIndex;
                        // Retrieve the corresponding row from tableData starting at index 2.
                        const row = tableData[idx + 2] || [];
                        const node = row[0] ? row[0] : "N/A";
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
                <div style={{ marginBottom: "1em" }}>
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

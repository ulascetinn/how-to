import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BackButtons from '../components/BackButtons';
import * as XLSX from 'xlsx';

export default function AirReleaseValvePlacement() {
    const [tableData, setTableData] = useState([]);

    // Load the table data from the Excel file in the public folder on mount
    useEffect(() => {
        fetch("/ARV_Form.xlsx")
            .then((response) => response.arrayBuffer())
            .then((data) => {
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                setTableData(jsonData);
            })
            .catch((error) => {
                console.error("Error fetching Excel file:", error);
                // If fetching fails, set default table data
                setTableData([
                    ["Valve ID", "Diameter (mm)", "Pressure (bar)", "Flow (m³/s)"],
                    ["ARV001", "150", "1.5", "0.25"],
                    ["ARV002", "200", "1.8", "0.30"],
                ]);
            });
    }, []);

    // Update a specific cell in the table.
    const handleCellChange = (rowIndex, colIndex, value) => {
        const newData = [...tableData];
        newData[rowIndex][colIndex] = value;
        setTableData(newData);
    };

    // Download the file from the public folder.
    const downloadExcel = () => {
        const link = document.createElement('a');
        link.href = "/ARV_Form.xlsx";
        link.download = "ARV_Form.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Clear all table cells (except the header row)
    const handleClear = () => {
        if (tableData.length > 0) {
            const header = tableData[0];
            const clearedRows = tableData.slice(1).map(row => row.map(() => ""));
            setTableData([header, ...clearedRows]);
        }
    };

    // Placeholder for the Place button functionality.
    const handlePlace = () => {
        // This functionality will perform data analysis, create graphs and files,
        // and will be implemented later (possibly in a separate file).
        alert("Place functionality will be implemented later.");
    };

    // Handle file upload: parse the uploaded Excel file and update the table.
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
            setTableData(jsonData);
        };
        reader.readAsBinaryString(file);
    };

    return (
        <>
            <Header />
            <div className="container">
                <h1>Air Release Valve Placement</h1>
                {tableData && tableData.length > 0 ? (
                    <table border="1">
                        <thead>
                            <tr>
                                {tableData[0].map((cell, colIndex) => (
                                    <th key={colIndex}>{cell}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.slice(1).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                        <td key={colIndex}>
                                            <input
                                                type="text"
                                                value={cell}
                                                onChange={(e) =>
                                                    handleCellChange(rowIndex + 1, colIndex, e.target.value)
                                                }
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Loading data...</p>
                )}
                <div style={{ marginTop: "1em" }}>
                    <button onClick={downloadExcel}>Download Form</button>
                    <input
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
                </div>
            </div>
            <BackButtons />
        </>
    );
}

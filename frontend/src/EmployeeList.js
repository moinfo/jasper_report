import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import ReportTemplateEditor from './ReportTemplateEditor';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        alert("Failed to fetch employees: " + err);
      });
  }, []);

  const handleExport = (type) => {
    const url = type === "pdf"
      ? "/api/reports/employees/pdf"
      : "/api/reports/employees/excel";
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.blob())
      .then((blob) => {
        const fileURL = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = fileURL;
        a.download = type === "pdf" ? "employee_report.pdf" : "employee_report.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert("Failed to export: " + err));
  };

  const handlePreview = () => {
    fetch("/api/reports/employees/preview", {
      method: "GET",
    })
      .then((response) => response.blob())
      .then((blob) => {
        const fileURL = window.URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      })
      .catch((err) => alert("Failed to preview report: " + err));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Employee List</h2>
        <div>
          <ReportTemplateEditor />
          <button className="btn btn-primary me-2" onClick={handlePreview}>
            Preview Report
          </button>
          <button className="btn btn-danger me-2" onClick={() => handleExport("pdf")}>
            Export PDF
          </button>
          <button className="btn btn-success" onClick={() => handleExport("excel")}>
            Export Excel
          </button>
        </div>
      </div>
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.address}</td>
              <td>{emp.phone}</td>
              <td>{emp.gender}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList; 
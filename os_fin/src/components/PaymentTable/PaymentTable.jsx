import React, { useEffect, useState } from "react";

function PaymentTable({ data, handleDelete, handleEdit }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1)
  }, [data]);

  // Format the date from YYYY-MM-DD to DD.MM.YYYY
  const formatDateToDDMMYYY = (date) => {
    if (date) {
      const [year, month, day] = date.split("-");
      return `${day}.${month}.${year}`;
    } else {
      return "";
    }
  };

  if (data.length === 0) {
    return <p>Žádná data k zobrazení.</p>;
  }

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Typ</th>
            <th>Částka</th>
            <th>Plátce</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((item) => (
            <tr key={item.id}>
              <td>{formatDateToDDMMYYY(item.date)}</td>
              <td>{item.type}</td>
              <td>{item.amount}</td>
              <td>{item.payer}</td>
              <td className="d-flex no-wrap">
                <button
                  className="btn btn-primary me-2"
                  onClick={() => handleEdit(item.id)}
                  data-bs-toggle="modal"
                  data-bs-target="#paymentModalChange"
                >
                  Upravit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(item.id)}
                >
                  Smazat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav>
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={handlePrevious}>
              Previous
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li
              key={i + 1}
              className={`page-item ${i + 1 === currentPage ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button className="page-link" onClick={handleNext}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default PaymentTable;

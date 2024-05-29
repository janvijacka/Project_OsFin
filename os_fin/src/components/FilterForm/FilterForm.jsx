import React, { useEffect, useState } from "react";

function FilterForm({ data, handleNewFilterParams, handleUpdate, id }) {
  const [filterFormParams, setFilterFormParams] = useState({
    dateFrom: "",
    dateTo: "",
    type: "",
    payer: "",
  });

  useEffect(() => {
    if (data) {
      setFilterFormParams({
        dateFrom: data.dateFrom || "",
        dateTo: data.dateTo || "",
        type: data.type || "",
        payer: data.payer || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilterFormParams((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    handleNewFilterParams({ ...filterFormParams, [name]: value });
  };

  const handleReset = () => {
    setFilterFormParams({
      dateFrom: "",
      dateTo: "",
      type: "",
      payer: "",
    });
    handleNewFilterParams({
      dateFrom: "",
      dateTo: "",
      type: "",
      payer: "",
    });
  };

  return (
    <div id={id}>
      <h2>Vyhledávání</h2>
      <div className="row mb-3">
        <div className="col-8 col-md-6 col-lg-3 mb-2">
          <label htmlFor={`${id}-dateFrom`} className="form-label">
            Od
          </label>
          <input
            type="date"
            name="dateFrom"
            id={`${id}-dateFrom`}
            className="form-control"
            value={filterFormParams.dateFrom}
            onChange={handleChange}
          />
        </div>
        <div className="col-8 col-md-6 col-lg-3 mb-2">
          <label htmlFor={`${id}-dateTo`} className="form-label">
            Do
          </label>
          <input
            type="date"
            name="dateTo"
            id={`${id}-dateTo`}
            className="form-control"
            value={filterFormParams.dateTo}
            onChange={handleChange}
          />
        </div>
        <div className="col-8 col-md-6 col-lg-3 mb-2">
          <label htmlFor={`${id}-paymentType`} className="form-label">
            Typ
          </label>
          <select
            name="type"
            id={`${id}-paymentType`}
            className="form-select"
            value={filterFormParams.type}
            onChange={handleChange}
          >
            <option value=""></option>
            <option value="potraviny">potraviny</option>
            <option value="benzín">benzín</option>
            <option value="drogerie">drogerie</option>
            <option value="elektronika">elektronika</option>
            <option value="služby">služby</option>
            <option value="doplňky stravy">doplňky stravy</option>
            <option value="léky">léky</option>
            <option value="jiné">jiné</option>
          </select>
        </div>
        <div className="col-8 col-md-6 col-lg-3 mb-2">
          <label htmlFor={`${id}-paymentPayer`} className="form-label">
            Platil/a
          </label>
          <select
            name="payer"
            id={`${id}-paymentPayer`}
            className="form-select"
            value={filterFormParams.payer}
            onChange={handleChange}
          >
            <option value=""></option>
            <option value="Honza">Honza</option>
            <option value="Janča">Janča</option>
            <option value="tester">tester</option>
          </select>
        </div>
      </div>
      <div className="mb-3">
        <button
          className="btn btn-primary me-3"
          onClick={() => handleUpdate(id)}
        >
          Filtrovat
        </button>
        <button className="btn btn-danger" onClick={() => handleReset()}>
          Resetovat
        </button>
      </div>
    </div>
  );
}

export default FilterForm;

import React from "react";
import { useEffect, useState } from "react";

function PaymentForm({
  data,
  handleNewData,
  handleUpdate,
  currentDate,
  userName,
  id,
}) {
  const [formData, setFormData] = useState({
    id: "",
    type: "",
    amount: "",
    payer: "",
    date: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        id: data.id || "",
        date: data.date || currentDate || "",
        type: data.type || "potraviny",
        amount: data.amount || "",
        payer: data.payer || userName || "",
      });
    }
  }, [data, currentDate, userName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    handleNewData({ ...formData, [name]: value }, id);
  };

  return (
    <div id={id}>
      <div className="mb-2">
        <label htmlFor={`${id}-paymentType`} className="form-label">
          Typ
        </label>
        <select
          name="type"
          id={`${id}-paymentType`}
          className="form-select"
          value={formData.type}
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
      <div className="mb-2">
        <label htmlFor={`${id}-paymentAmount`} className="form-label">
          Částka
        </label>
        <input
          type="number"
          name="amount"
          id={`${id}-paymentAmount`}
          className="form-control"
          value={formData.amount}
          onChange={handleChange}
        />
      </div>
      <div className="mb-2">
        <label htmlFor={`${id}-paymentPayer`} className="form-label">
          Platil
        </label>
        <select
          name="payer"
          id={`${id}-paymentPayer`}
          className="form-select"
          value={formData.payer}
          onChange={handleChange}
        >
          <option value="Honza">Honza</option>
          <option value="Janča">Janča</option>
          <option value="tester">tester</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor={`${id}-paymentDate`} className="form-label">
          Datum
        </label>
        <input
          type="date"
          name="date"
          id={`${id}-paymentDate`}
          className="form-control"
          value={formData.date}
          onChange={handleChange}
        />
      </div>
      <div>
        <button
          className="btn btn-primary me-3"
          onClick={() => handleUpdate(id)}
          data-bs-dismiss="modal"
        >
          Uložit
        </button>
        <button className="btn btn-danger" data-bs-dismiss="modal">
          Zrušit
        </button>
      </div>
    </div>
  );
}

export default PaymentForm;

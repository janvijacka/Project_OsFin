import React from "react";

function LoginForm({ data, handleLogin, handleUser, id }) {
  const handleChange = (e) => {
    let temp = { ...data };
    const { name, value } = e.target;
    switch (name) {
      case "username": {
        temp.userName = value;
        break;
      }
      case "passwd": {
        temp.passwd = value;
        break;
      }
      default:
        break;
    }
    handleUser(temp, id);
  };

  return (
    <div id={id}>
      <div className="mb-2 col-10 col-sm-6 col-lg-4">
        <label htmlFor="loginUsername" className="label-form">
          Uživatelské jméno:
        </label>
        <input
          type="text"
          name="username"
          id="loginUsername"
          className="form-control"
          value={data.userName}
          onChange={handleChange}
        />
      </div>
      <div className="mb-2 col-10 col-sm-6 col-lg-4">
        <label htmlFor="loginPasswd" className="label-form">
          Heslo:
        </label>
        <input
          type="password"
          name="passwd"
          id="loginPasswd"
          className="form-control"
          value={data.passwd}
          onChange={handleChange}
        />
      </div>
      <div>
        <button className="btn btn-primary" onClick={() => handleLogin(id)}>
          Přihlásit se
        </button>
      </div>
    </div>
  );
}

export default LoginForm;

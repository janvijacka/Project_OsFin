import "./App.css";
import { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import LoginForm from "./components/LoginForm/LoginForm";
import PaymentTable from "./components/PaymentTable/PaymentTable";
import PaymentForm from "./components/PaymentForm/PaymentForm";
import FilterForm from "./components/FilterForm/FilterForm";
import axios from "axios";

function App() {
  const [user, setUser] = useState({
    userName: "",
    passwd: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [paymentsToShow, setPaymentsToShow] = useState([]);
  const [newPayment, setNewPayment] = useState({
    id: 0,
    type: "",
    amount: "",
    payer: "",
    date: "",
  });
  const [paymentToChange, setPaymentToChange] = useState({
    id: 0,
    type: "",
    amount: "",
    payer: "",
    date: "",
  });
  const [filterParams, setFilterParams] = useState({
    dateFrom: "",
    dateTo: "",
    type: "",
    payer: "",
  });
  const [sumShown, setSumShown] = useState(0);

  //Získání aktuálního data
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    return `${day}.${month}.${year}`;
  };

  const getcurrentYear = (date) => {
    if (date) {
      const year = date.split(".")[2];
      return year;
    } else return "";
  };

  const currentDate = getCurrentDate();
  const currentYear = getcurrentYear(currentDate);

  //Zformátování data pro použití jako výchozí hodnoty v inputu date
  const formatDateToYYYYMMDD = (date) => {
    if (date) {
      const [day, month, year] = date.split(".");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } else return "";
  };

  // Kontrola přihlášení
  useEffect(() => {
    axios
      .get("./server/index.php?action=checkUserName")
      //.get("http://localhost/server/index.php?action=checkUserName")
      .then((response) => {
        const isLoggedIn = response.data.userNameExists;
        setIsLoggedIn(isLoggedIn);
        if (isLoggedIn) {
          setUserName(response.data.username);
          setNewPayment((prevPayment) => ({
            ...prevPayment,
            payer: response.data.username,
          }));
        }
      })
      .catch((error) => {
        console.error("Vyskytla se chyba při volání php scriptu:", error);
      });
  }, []);

  const handleUser = (newUser, source) => {
    if (source === "login-form") {
      setUser(newUser);
    }
  };

  //PŘIHLÁŠENÍ
  const handleLogin = () => {
    axios
      .get("./server/index.php?action=handleLogin", {
        params: {
          username: user.userName,
          password: user.passwd,
        },
      })
      .then((response) => {
        if (response.data.success) {
          alert("Proběhlo přihlášení!");
          setUserName(response.data.username);
          setIsLoggedIn(true);
          setUser({ userName: "", passwd: "" });
        } else {
          alert("Špatné přihlašovací údaje!")
          console.error("Chyba při přihlašování: " + response.data.message);
        }
      })
      .catch((error) => {
        console.error("Chyba při přihlašování: ", error);
        alert("Chyba při přihlašování!");
      });
  };

  useEffect(() => {
    if (userName) {
      getPayments();
    }
  }, [userName]);

  //ODHLÁŠENÍ
  const handleLogout = () => {
    axios
      .get("./server/index.php?action=handleLogout")
      .then((response) => {
        if (response.data.success) {
          alert("Proběhlo odhlášení!");
          setUserName("");
          setIsLoggedIn(false);
          setUser({ userName: "", passwd: "" });
          setFilterParams({
            dateFrom: "",
            dateTo: "",
            type: "",
            payer: "",
          });
          setPaymentsToShow([]);
          setNewPayment({
            id: 0,
            type: "",
            amount: "",
            payer: "",
            date: "",
          });
        } else {
          console.error("Chyba při odhlašování: " + response.data.message);
        }
      })
      .catch((error) => {
        console.error("Chyba při odhlašování: ", error);
        alert("Chyba při odhlašování!");
      });
  };

  const getPayments = () => {
    axios
      .get("./server/index.php?action=getDefault", {
        params: {
          userName: userName,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setPaymentsToShow(response.data);
          countSum(response.data);
        } else {
          console.error("Ospověď od serveru není pole!");
        }
      })
      .catch((error) => {
        console.error("Chyba serveru: ", error);
        alert(`Chyba serveru: ${error}`);
      });
  };

  const getFilteredPayments = () => {
    axios
      .get("./server/index.php?action=getFilteredPayments", {
        params: {
          dateFrom: filterParams.dateFrom,
          dateTo: filterParams.dateTo,
          type: filterParams.type,
          payer: filterParams.payer,
          userName: userName,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setPaymentsToShow(response.data);
          countSum(response.data);
        } else {
          console.error("Ospověď od serveru není pole!");
          console.log(response.data);
        }
      })
      .catch((error) => {
        console.error("Chyba serveru: ", error);
        alert(`Chyba serveru: ${error}`);
      });
  };

  const countSum = (payments) => {
    let sum = 0;
    payments.forEach((element) => {
      sum += element.amount;
    });
    setSumShown(sum);
  };
  //Vložení platby
  const insertPayment = (paymentWithUserName) => {
    axios
      .post("./server/index.php", paymentWithUserName)
      .then((response) => {
        console.log(response.data);
        getFilteredPayments();
        alert("Platba vložena.");
      })
      .catch((error) => {
        console.error("Chyba serveru:", error);
        alert(`Chyba serveru: ${error}`);
      });
  };

  //Úprava platby
  const handleEdit = (idToChange) => {
    const temp = paymentsToShow.filter((payment) => payment.id === idToChange);
    setPaymentToChange(...temp);
  };

  const updatePayment = (paymentWithUserName) => {
    axios
      .put("./server/index.php", paymentWithUserName)
      .then((response) => {
        console.log(response.data);
        getPayments();
      })
      .catch((error) => {
        console.error("Chyba serveru:", error);
        alert(`Chyba serveru: ${error}`);
      });
  };

  //Smazání platby
  const handleDelete = (idToDel) => {
    const confirm = window.confirm("Pravdu chceš platbu smazat?");
    if (confirm) {
      deletePayment(idToDel);
    }
  };

  const deletePayment = (id) => {
    axios
      .delete(`./server/${id}/${userName}`)
      .then((response) => {
        console.log(response.data);
        //Pomocí setPaymentsToShow se odebere jen aktuálně odebraná platba a nemusí se znovu načítat všechna data z tabulky pomocí getPayments().
        setPaymentsToShow((prevPayments) =>
          prevPayments.filter((payment) => payment.id !== id)
        );
      })
      .catch((error) => {
        console.error("Chyba serveru: ", error);
        alert(`Chyba serveru: ${error}`);
      });
  };

  const fillDefaultInfos = (payment) => {
    const filledPayment = {
      ...payment,
      type: payment.type !== "" ? payment.type : "potraviny",
      payer: payment.payer !== "" ? payment.payer : userName,
      date:
        payment.date !== "" ? payment.date : formatDateToYYYYMMDD(currentDate),
    };
    return filledPayment;
  };

  const handleNewData = (updatedPayment, source) => {
    switch (source) {
      case "add-payment-form": {
        setNewPayment(updatedPayment);
        break;
      }
      case "change-payment-form": {
        setPaymentToChange(updatedPayment);
        break;
      }
      default:
        break;
    }
  };

  const handleNewFilterParams = (updatedFilterParams) => {
    setFilterParams(updatedFilterParams);
  };

  const handleUpdate = (source) => {
    let temp;
    switch (source) {
      case "add-payment-form": {
        temp = fillDefaultInfos(newPayment);
        const paymentWithUsername = {
          payment: temp,
          userName: userName,
        };
        insertPayment(paymentWithUsername);
        setNewPayment({
          type: "",
          date: "",
          amount: "",
          payer: "",
        });
        break;
      }
      case "change-payment-form": {
        const confirm = window.confirm("Opravdu si přejete upravit platbu?");
        if (confirm) {
          const index = paymentsToShow.findIndex(
            (payment) => payment.id === paymentToChange.id
          );
          if (index !== -1) {
            const paymentWithUsername = {
              payment: paymentToChange,
              userName: userName,
            };
            updatePayment(paymentWithUsername);
            setPaymentToChange({
              id: 0,
              type: "",
              amount: "",
              payer: "",
              date: "",
            });
          } else {
            alert("Platba s daným id nebyla nalezena.");
            setPaymentToChange({
              id: 0,
              type: "",
              amount: "",
              payer: "",
              date: "",
            });
          }
        }
        break;
      }
      case "filter-form": {
        if (
          filterParams.dateFrom !== "" ||
          filterParams.dateTo !== "" ||
          filterParams.payer !== "" ||
          filterParams.type !== ""
        ) {
          getFilteredPayments(filterParams);
        } else {
          getPayments();
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <HelmetProvider>
      <div className="d-flex flex-column min-vh-100">
        <Helmet>
          <html lang="cs" data-bs-theme="dark" />
          <title>Naše výdaje</title>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest"></link>
        </Helmet>
        <header className="container">
          <h1 className="text-center py-3">Naše výdaje</h1>
          {isLoggedIn ? (
            <p>
              Jsi přihlášen/á jako:{" "}
              <span className="fw-semibold">{userName}</span>
              <br />
              Dnešní datum: <span className="fw-semibold">{currentDate}</span>
              <br />
              <button className="btn btn-warning mb-3" onClick={handleLogout}>Odhlásit</button>
            </p>
          ) : (
            <div className="mb-3">
              <h2>Přihlášení</h2>
              <LoginForm
                id="login-form"
                data={user}
                handleUser={handleUser}
                handleLogin={handleLogin}
              />
            </div>
          )}
        </header>
        <main className="container">
          {isLoggedIn ? (
            <div>
              <button
                className="btn btn-primary mb-3"
                data-bs-toggle="modal"
                data-bs-target="#paymentModalAdd"
              >
                Přidat platbu
              </button>
              <FilterForm
                id="filter-form"
                data={filterParams}
                handleNewFilterParams={handleNewFilterParams}
                handleUpdate={handleUpdate}
              />
              <p>
                Suma načtených položek:{" "}
                <span className="fw-semibold">{sumShown}</span> Kč
              </p>
              <div
                className="modal fade"
                id="paymentModalAdd"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
              >
                <div className="modal-dialog modal-sm">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h3>Nová platba</h3>
                    </div>
                    <div className="modal-body">
                      <PaymentForm
                        id="add-payment-form"
                        data={newPayment}
                        currentDate={formatDateToYYYYMMDD(currentDate)}
                        userName={userName}
                        handleNewData={handleNewData}
                        handleUpdate={handleUpdate}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <PaymentTable
                data={paymentsToShow}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
              <div
                className="modal fade"
                id="paymentModalChange"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
              >
                <div className="modal-dialog modal-sm">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h3>Úprava platby</h3>
                    </div>
                    <div className="modal-body">
                      <PaymentForm
                        id="change-payment-form"
                        data={paymentToChange}
                        handleNewData={handleNewData}
                        handleUpdate={handleUpdate}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p>Pro přihlášení k testovacímu účtu použij účet:<br />
              Uživatelské jméno: tester <br />
              Heslo: 1.tajneheslo
              </p>
            </div>
          )}
        </main>
        <footer className="footer mt-auto py-3">
          <p className="container">
            &copy; {currentYear} Ing. Jan Vijačka. Všechna práva vyhrazena.
          </p>
        </footer>
      </div>
    </HelmetProvider>
  );
}

export default App;

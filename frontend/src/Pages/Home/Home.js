import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/Header";
import { Link, useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container } from "react-bootstrap";
import "./home.css";
import {
  addTransaction,
  getTransactions,
  getAllCategories,
} from "../../utils/ApiRequest";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Analytics from "./Analytics";

const Home = () => {
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };
  const [cUser, setcUser] = useState();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [view, setView] = useState("table");
  const [currency, setCurrency] = useState();
  const [sortBy, setSortBy] = useState("all");

  const handleStartChange = (date) => {
    setStartDate(date);
  };

  const handleEndChange = (date) => {
    setEndDate(date);
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const avatarFunc = async () => {
      if (localStorage.getItem("user")) {
        const user = JSON.parse(localStorage.getItem("user"));
        console.log(user);

        if (user.isAvatarImageSet === false || user.avatarImage === "") {
          navigate("/setAvatar");
        }
        setcUser(user);
        setRefresh(true);
      } else {
        navigate("/login");
      }
    };

    avatarFunc();
  }, [navigate]);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
    currency: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };
  const handleChangeFrequency = (e) => {
    setFrequency(e.target.value);
  };

  const handleSetType = (e) => {
    setType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      title,
      amount,
      description,
      category,
      date,
      transactionType,
      currency,
    } = values;

    if (
      !title ||
      !amount ||
      !description ||
      !category ||
      !date ||
      !transactionType ||
      !currency
    ) {
      toast.error("Please enter all the fields", toastOptions);
    }
    setLoading(true);

    const { data } = await axios.post(addTransaction, {
      title: title,
      amount: amount,
      description: description,
      category: category,
      date: date,
      transactionType: transactionType,
      currency: currency,
      userId: cUser._id,
    });

    if (data.success === true) {
      toast.success(data.message, toastOptions);
      handleClose();
      setRefresh(!refresh);
      setValues({
        title: "",
        amount: "",
        description: "",
        category: "",
        date: "",
        transactionType: "",
        currency: "",
      });
    } else {
      toast.error(data.message, toastOptions);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setType("all");
    setStartDate(null);
    setEndDate(null);
    setFrequency("7");
    setSortBy(null);
  };

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        setLoading(true);
        console.log(cUser._id, frequency, startDate, endDate, type);
        const { data } = await axios.post(getTransactions, {
          userId: cUser._id,
          frequency: frequency,
          startDate: startDate,
          endDate: endDate,
          type: type,
        });
        let sortedTransactions = [...data.transactions];

        if (sortBy === "price") {
          sortedTransactions = data.transactions.sort(
            (a, b) => a.amount - b.amount
          );
        } else if (sortBy === "date") {
          sortedTransactions = data.transactions.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
        }
        setTransactions(sortedTransactions);
        console.log(data);

        setTransactions(data.transactions);

        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    fetchAllTransactions();
  }, [refresh, frequency, endDate, type, startDate, sortBy]);

  const handleTableClick = (e) => {
    setView("table");
  };

  const handleChartClick = (e) => {
    setView("chart");
  };

  const categories = [
    ...new Set(transactions.map((transaction) => transaction.category)),
  ];

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <>
      <Header />

      {loading ? (
        <>
          <Spinner />
        </>
      ) : (
        <>
          <Container
            style={{ position: "relative", zIndex: "2 !important" }}
            className="mt-3"
          >
            <div className="filterRow">
              <div className="text-white">
                <Form.Group
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                  }}
                  className="mb-3"
                  controlId="formSelectFrequency"
                >
                  <Form.Label>Select Frequency</Form.Label>
                  <Form.Select
                    name="frequency"
                    value={frequency}
                    onChange={handleChangeFrequency}
                    style={{
                      fontFamily: "San Francisco",
                      fontWeight: "bold",
                    }}
                  >
                    <option value="7">Last Week</option>
                    <option value="30">Last Month</option>
                    <option value="365">Last Year</option>
                    <option value="custom">Custom</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="text-white type">
                <Form.Group className="mb-3" controlId="formSelectFrequency">
                  <Form.Label
                    style={{
                      fontFamily: "San Francisco",
                      fontWeight: "bold",
                    }}
                  >
                    Type
                  </Form.Label>
                  <Form.Select
                    name="type"
                    value={type}
                    onChange={handleSetType}
                    style={{
                      fontFamily: "San Francisco",
                      fontWeight: "bold",
                    }}
                  >
                    <option value="all">All</option>
                    <option value="expense">Expense</option>
                    <option value="credit">Income</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="text-white type">
                <Form.Group className="mb-3" controlId="formSelectFrequency">
                  <Form.Label
                    style={{
                      fontFamily: "San Francisco",
                      fontWeight: "bold",
                    }}
                  >
                    Sort by
                  </Form.Label>
                  <Form.Select
                    name="sort"
                    value={sortBy}
                    onChange={handleSortChange}
                    style={{
                      fontFamily: "San Francisco",
                      fontWeight: "bold",
                    }}
                  >
                    <option value="all">All</option>
                    <option value="price">Amount</option>
                    <option value="date">Date</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="text-white iconBtnBox">
                <lord-icon
                  src="https://cdn.lordicon.com/yqiuuheo.json"
                  trigger="hover"
                  colors="primary:#242424,secondary:#ebe6ef"
                  stroke="bold"
                  state="loop-all"
                  style={{ cursor: "pointer" }}
                  onClick={handleTableClick}
                ></lord-icon>

                <lord-icon
                  src="https://cdn.lordicon.com/zsaomnmb.json"
                  trigger="hover"
                  style={{ cursor: "pointer" }}
                  onClick={handleChartClick}
                ></lord-icon>
              </div>

              <div className="flex">
                <Link to={"/addtransactions"}>
                  <lord-icon
                    src="https://cdn.lordicon.com/pdsourfn.json"
                    trigger="hover"
                    stroke="bold"
                    onClick={handleShow}
                    colors="primary:#121331,secondary:#ffffff,tertiary:#ebe6ef"
                    style={{ width: "70px", height: "70px", cursor: "pointer" }}
                  ></lord-icon>
                </Link>
              </div>
            </div>
            <br style={{ color: "white" }}></br>

            {frequency === "custom" ? (
              <>
                <div className="date">
                  <div className="form-group">
                    <label htmlFor="startDate" className="text-white">
                      Start Date:
                    </label>
                    <div>
                      <DatePicker
                        selected={startDate}
                        onChange={handleStartChange}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate" className="text-white">
                      End Date:
                    </label>
                    <div>
                      <DatePicker
                        selected={endDate}
                        onChange={handleEndChange}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}

            <div className="containerBtn">
              <lord-icon
                src="https://cdn.lordicon.com/cjbuodml.json"
                trigger="hover"
                colors="primary:#ffffff,secondary:#121331"
                onClick={handleReset}
                style={{ width: "50px", height: "50px", cursor: "pointer" }}
              ></lord-icon>
            </div>
            {view === "table" ? (
              <>
                <TableData data={transactions} user={cUser} />
              </>
            ) : (
              <>
                <Analytics
                  transactions={transactions}
                  user={cUser}
                  categories={categories}
                  currency={currency}
                />
              </>
            )}
            <ToastContainer />
          </Container>
        </>
      )}
    </>
  );
};

export default Home;

import React, { useCallback, useEffect, useRef, useState } from "react";
import Header from "../../components/Header";
import { Link, useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container, ButtonGroup } from "react-bootstrap";
import "./home.css";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import {
  addTransaction,
  getTransactions,
  addCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
} from "../../utils/ApiRequest";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Analytics from "./Analytics";

const AddDetails = () => {
  const navigate = useNavigate();
  const particlesLoaded = useCallback(async (container) => {}, []);

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
  const [dbCategories, setdbCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);
  const handleStartChange = (date) => {
    setStartDate(date);
  };

  const handleEndChange = (date) => {
    setEndDate(date);
  };

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

    const { title, amount, description, date, transactionType, currency } =
      values;

    if (
      !title ||
      !amount ||
      !description ||
      !date ||
      !transactionType ||
      !currency
    ) {
      toast.error("Please enter all the fields", toastOptions);
      return;
    }

    if (!selectedCategory) {
      toast.error("Please select a category", toastOptions);
      return;
    }

    setLoading(true);

    const { data } = await axios.post(addTransaction, {
      title: title,
      amount: amount,
      description: description,
      category: selectedCategory.name,
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
        console.log(data);

        setTransactions(data.transactions);

        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    fetchAllTransactions();
  }, [refresh, frequency, endDate, type, startDate]);

  const handleTableClick = (e) => {
    setView("table");
  };

  const handleChartClick = (e) => {
    setView("chart");
  };

  const categories = [
    ...new Set(transactions.map((transaction) => transaction.category)),
  ];

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

  const handleClose = () => setShow(false);

  const handleCatChange = (e) => {
    const categoryName = e.target.value.toLowerCase();
    setValues({ ...values, category: categoryName });
  };

  const handleCategoryAdd = async (e) => {
    e.preventDefault();
    const { category } = values;

    if (!category) {
      toast.error("Please enter Name!", toastOptions);
      return;
    }
    const categoryExists = dbCategories.some(
      (cat) => cat.name.toLowerCase() === category.toLowerCase()
    );

    if (categoryExists) {
      toast.error("Category already exists!", toastOptions);
      return;
    }
    setLoading(true);
    const { data } = await axios.post(addCategory, { name: category });

    if (data.success === true) {
      toast.success(data.message, toastOptions);
      setRefresh(!refresh);
      setValues({ ...values, category: "" });
      setdbCategories((prevCategories) => [
        ...prevCategories,
        { name: category },
      ]);
    } else {
      toast.error(data.message, toastOptions);
    }

    setLoading(false);
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(getAllCategories);
        setdbCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [refresh]);
  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      if (!selectedCategory) {
        console.error("No category selected for deletion");
        return;
      }

      const categoryId = selectedCategory._id;

      console.log({ categoryId });

      const response = await axios.delete(`${deleteCategory}/${categoryId}`);

      console.log(response.data);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleEditCategory = async () => {
    try {
      if (!selectedCategory) {
        console.error("No category selected for editing");
        return;
      }
      setEditCategoryName(selectedCategory.name);
      handleShow();
    } catch (error) {
      console.error("Error editing category:", error);
    }
  };

  const handleSubmitEditCategory = async () => {
    try {
      const categoryId = selectedCategory._id;

      const response = await axios.put(`${updateCategory}/${categoryId}`, {
        name: editCategoryName,
      });

      console.log(response.data);

      setdbCategories((prevCategories) =>
        prevCategories.map((category) =>
          category._id === categoryId
            ? { ...category, name: editCategoryName }
            : category
        )
      );

      handleClose();
    } catch (error) {
      console.error("Error editing category:", error);
    }
  };

  return (
    <>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "#FFF",
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#1a7cb2",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 6,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 70,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
        style={{
          position: "absolute",
          zIndex: -1,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <Container
        style={{ position: "relative", zIndex: "2 !important" }}
        className="mt-3"
      >
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              type="text"
              placeholder="Enter new category name"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-danger" onClick={handleClose}>
              Close
            </Button>
            <Button
              variant="outline-success"
              onClick={handleSubmitEditCategory}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              type="text"
              placeholder="Enter new category name"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-danger" onClick={handleClose}>
              Close
            </Button>
            <Button
              variant="outline-success"
              onClick={handleSubmitEditCategory}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
        <div className="w-1/2 mt-10 mx-auto justify-center  items-center">
          <h1
            className="justify-center items-center text-[#07074D] mb-3"
            style={{ fontFamily: "Kanit, sans-serif" }}
          >
            Add Transaction Details
          </h1>

          <Form>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label
                style={{ fontFamily: "San Francisco", fontWeight: "bold" }}
                className=" mb-1 block text-base font-medium text-[#07074D]"
              >
                Transaction Name
              </Form.Label>
              <Form.Control
                name="title"
                type="text"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-2 px-4 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                placeholder="Enter Transaction Name"
                value={values.name}
                onChange={handleChange}
                style={{ fontFamily: "San Francisco" }}
              />
            </Form.Group>
            <div className="mb-3 flex gap-3">
              <Form.Group
                className="w-1/2 mt-1 block text-base font-medium text-[#07074D]"
                controlId="formSelect"
                style={{ fontFamily: "San Francisco", fontWeight: "bold" }}
              >
                <Form.Label>Currency</Form.Label>
                <Form.Select
                  name="currency"
                  value={values.currency}
                  onChange={handleChange}
                >
                  <option value="">Choose...</option>
                  <option value="USD">USD</option>
                  <option value="EURO">EURO</option>
                  <option value="RUPEE">RUPEE</option>
                </Form.Select>
              </Form.Group>

              <Form.Group
                className="w-1/2 mt-1 block text-base font-medium text-[#07074D]"
                controlId="formAmount"
                style={{ fontFamily: "San Francisco", fontWeight: "bold" }}
              >
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  name="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={values.amount}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>

            <div className="mb-1 flex gap-3">
              <Form.Group
                className="mb-1 block text-base font-medium text-[#07074D]"
                controlId="formName"
                style={{ fontFamily: "San Francisco", fontWeight: "bold" }}
              >
                <Form.Label>Add New Category</Form.Label>
                <div className="flex items-center">
                  <Form.Control
                    name="category"
                    type="text"
                    style={{ width: "100%", height: "50px" }}
                    className="w-full mb-2 rounded-md border border-[#e0e0e0] bg-white py-2 px-4 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                    placeholder="Enter category name"
                    value={values.name}
                    onChange={handleCatChange}
                  />
                  <button
                    onClick={handleCategoryAdd}
                    style={{ height: "40px" }}
                    className=" hover:bg-green-500 text-green-700 font-semibold hover:text-black py-2 px-4 border border-blue-500 hover:border-transparent rounded m-2"
                  >
                    Add
                  </button>
                </div>
              </Form.Group>
            </div>
            <div class="flex items-center">
              <div class="flex-1 border-t-2 border-gray-200"></div>
              <span
                style={{ fontFamily: "San Francisco", fontWeight: "bold" }}
                class="px-3 text-gray-500 bg-white"
              >
                OR choose from these
              </span>
              <div class="flex-1 border-t-2 border-gray-200"></div>
            </div>
            <div
              className="text-[#07074D] font-semibold"
              style={{ fontFamily: "San Francisco", fontWeight: "bold" }}
            >
              Available Categories
            </div>
            <div className="mt-2">
              {dbCategories.map(
                (category, index) =>
                  index % 6 === 0 && (
                    <div key={index} className="d-flex flex-wrap">
                      {dbCategories.slice(index, index + 6).map((category) => (
                        <Button
                          key={category._id}
                          variant={
                            selectedCategory === category
                              ? "secondary"
                              : "outline-secondary"
                          }
                          onClick={() => handleCategorySelect(category)}
                          className="me-2 mb-2 text-black"
                          style={{
                            width: "100px",
                            fontFamily: "San Francisco",
                            fontWeight: "bold",
                          }}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  )
              )}
            </div>
            <div className="mt-2 flex justify-between">
              <button
                className="hover:bg-red-500 text-red-700 font-semibold hover:text-black py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                onClick={handleDeleteCategory}
                style={{ fontFamily: "San Francisco", fontWeight: "bold" }}
              >
                Delete Category
              </button>
              <button
                className="hover:bg-yellow-500 text-black-700 font-semibold hover:text-black py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                onClick={handleEditCategory}
                style={{ fontFamily: "San Francisco", fontWeight: "bold" }}
                type="button"
              >
                Edit Category
              </button>
            </div>

            <Form.Group
              className="mt-1 block text-base font-medium text-[#07074D]"
              controlId="formDescription"
              style={{ fontFamily: "San Francisco", fontWeight: "bold" }}
            >
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                className="w-full mb-2 rounded-md border border-[#e0e0e0] bg-white py-2 px-4 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                placeholder="Enter Description"
                value={values.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group
              className="mt-1 block text-base font-medium text-[#07074D]"
              controlId="formSelect1"
              style={{ fontFamily: "San Francisco", fontWeight: "bold" }}
            >
              <Form.Label>Transaction Type</Form.Label>
              <Form.Select
                className="mb-2"
                name="transactionType"
                value={values.transactionType}
                onChange={handleChange}
              >
                <option value="">Choose...</option>
                <option value="credit">Income</option>
                <option value="expense">Expense</option>
              </Form.Select>
            </Form.Group>

            <Form.Group
              className="mt-1 block text-base font-medium text-[#07074D]"
              controlId="formDate"
              style={{ fontFamily: "San Francisco", fontWeight: "bold" }}
            >
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={values.date}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
          <div className="flex m-2 justify-center items-center">
            <button
              class=" hover:bg-red-500 text-red-700 font-semibold hover:text-black py-2 px-4 border border-blue-500 hover:border-transparent rounded"
              onClick={() => navigate("/")}
              style={{ fontFamily: "San Francisco", fontWeight: "bold" }}
            >
              Close
            </button>
            <button
              class=" hover:bg-green-500 text-green-700 font-semibold hover:text-black py-2 px-4 border border-blue-500 hover:border-transparent rounded m-2"
              onClick={handleSubmit}
              style={{ fontFamily: "San Francisco", fontWeight: "bold" }}
            >
              Submit
            </button>
          </div>
        </div>
      </Container>
    </>
  );
};

export default AddDetails;

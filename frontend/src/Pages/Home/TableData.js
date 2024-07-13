import React, { useEffect, useState } from "react";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import moment from "moment";
import "./home.css";
import {
  deleteTransactions,
  editTransactions,
  getAllCategories,
} from "../../utils/ApiRequest";
import axios from "axios";
import { Toast } from "react-bootstrap";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
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
const TableData = (props) => {
  const [show, setShow] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currId, setCurrId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [user, setUser] = useState(null);
  const [dbCategories, setdbCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleEditClick = (itemKey) => {
    console.log("Clicked button ID:", itemKey);
    if (transactions.length > 0) {
      const editTran = props.data.filter((item) => item._id === itemKey);
      setCurrId(itemKey);
      setEditingTransaction(editTran);
      handleShow();
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`,
    });

    if (result.isConfirmed) {
      const { data } = await axios.put(`${editTransactions}/${currId}`, {
        ...values,
      });

      if (data.success === true) {
        await handleClose();
        await setRefresh(!refresh);
        window.location.reload();
      } else {
        console.log("error");
      }
    } else if (result.isDenied) {
      Swal.fire("Changes are not saved", "", "info");
    }
  };

  const handleDeleteClick = async (itemKey) => {
    console.log(user._id);
    console.log("Clicked button ID delete:", itemKey);
    setCurrId(itemKey);

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { data } = await axios.post(`${deleteTransactions}/${itemKey}`, {
          userId: props.user._id,
        });

        if (data.success === true) {
          await setRefresh(!refresh);
          window.location.reload();
        } else {
          Toast.error("Something went wrong!");
        }

        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      }
    });
  };

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => {
    setShow(true);
  };

  useEffect(() => {
    setUser(props.user);
    setTransactions(props.data);
  }, [props.data, props.user, refresh]);

  const exportToExcel = () => {
    let totalExpense = 0;
    let totalCredit = 0;
    let overallTotal = 0;

    props.data.forEach((item) => {
      const amount = parseFloat(item.amount);
      overallTotal += amount;

      if (item.transactionType === "expense") {
        totalExpense += amount;
      } else if (item.transactionType === "credit") {
        totalCredit += amount;
      }
    });

    const dataToExport = props.data.map((item) => ({
      Date: moment(item.date).format("DD-MM-YYYY"),
      Title: item.title,
      Amount: item.amount,
      Type: item.transactionType,
      Category: item.category,
    }));

    dataToExport.push(
      {
        Date: "",
        Title: "Total Income:",
        Amount: totalCredit.toFixed(2),
        Type: "",
        Category: "",
      },
      {
        Date: "",
        Title: "Total Expense:",
        Amount: totalExpense.toFixed(2),
        Type: "",
        Category: "",
      },
      {
        Date: "",
        Title: "Overall Total:",
        Amount: overallTotal.toFixed(2),
        Type: "",
        Category: "",
      }
    );

    const ws = XLSX.utils.json_to_sheet(dataToExport);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    XLSX.writeFile(wb, "transactions.xlsx");
  };

  const handleCategorySelect = async (category) => {
    try {
      if (selectedCategory === category) {
        setSelectedCategory(null);
      } else {
        setSelectedCategory(category);
      }
      const { data } = await axios.put(`${editTransactions}/${currId}`, {
        category: category,
      });

      if (data.success === true) {
        await setRefresh(!refresh);
      } else {
        console.log("error");
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
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

  return (
    <>
      <Container>
        <Table
          responsive="md"
          className="rounded-table border-dashed hover:border-solid border-2  border-sky-800 data-table"
        >
          <thead>
            <tr>
              <th>
                <div
                  className="flex"
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  Date
                  <lord-icon
                    src="https://cdn.lordicon.com/wmlleaaf.json"
                    trigger="loop"
                    style={{ width: "25px", height: "25px" }}
                  ></lord-icon>
                </div>
              </th>
              <th>
                <div
                  className="flex"
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  Title
                  <lord-icon
                    src="https://cdn.lordicon.com/fnxnvref.json"
                    trigger="loop"
                    style={{ width: "25px", height: "25px" }}
                  ></lord-icon>
                </div>
              </th>
              <th>
                <div
                  className="flex"
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  Amount
                  <lord-icon
                    src="https://cdn.lordicon.com/ncitidvz.json"
                    trigger="loop"
                    style={{ width: "25px", height: "25px" }}
                  ></lord-icon>
                </div>
              </th>
              <th>
                <div
                  className="flex"
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  Type
                  <lord-icon
                    src="https://cdn.lordicon.com/ipnwkgdy.json"
                    trigger="loop"
                    style={{ width: "25px", height: "25px" }}
                  ></lord-icon>
                </div>
              </th>
              <th>
                <div
                  className="flex"
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  Category
                  <lord-icon
                    src="https://cdn.lordicon.com/jnikqyih.json"
                    trigger="loop"
                    style={{ width: "25px", height: "25px" }}
                  ></lord-icon>
                </div>
              </th>
              <th>
                <div
                  className="flex"
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  Action
                  <lord-icon
                    src="https://cdn.lordicon.com/xkmjbjuw.json"
                    trigger="loop"
                    style={{ width: "25px", height: "25px" }}
                  ></lord-icon>
                </div>
              </th>
            </tr>
          </thead>
          <tbody
            style={{
              fontFamily: "San Francisco",
              fontSize: "18px",
            }}
            className="text-white"
          >
            {props.data.map((item, index) => (
              <tr key={index}>
                <td>{moment(item.date).format("YYYY-MM-DD")}</td>
                <td>{item.title}</td>
                <td>{item.amount}</td>
                <td>{item.transactionType}</td>
                <td>
                  {dbCategories.find(
                    (category) => category._id === item.category
                  )?.name || item.category}
                </td>
                <td>
                  <div className="icons-handle">
                    <lord-icon
                      src="https://cdn.lordicon.com/lsrcesku.json"
                      trigger="hover"
                      colors="primary:#121331,secondary:#242424,tertiary:#ffc738,quaternary:#e4e4e4"
                      style={{ cursor: "pointer" }}
                      key={item._id}
                      id={item._id}
                      onClick={() => handleEditClick(item._id)}
                    ></lord-icon>

                    <lord-icon
                      src="https://cdn.lordicon.com/xekbkxul.json"
                      trigger="hover"
                      stroke="bold"
                      style={{ cursor: "pointer" }}
                      colors="primary:#ffffff,secondary:#e83a30,tertiary:#646e78,quaternary:#ebe6ef"
                      key={index}
                      id={item._id}
                      onClick={() => handleDeleteClick(item._id)}
                    ></lord-icon>

                    {editingTransaction ? (
                      <>
                        <div>
                          <Modal show={show} onHide={handleClose} centered>
                            <Modal.Header closeButton>
                              <Modal.Title
                                style={{
                                  fontFamily: "Kanit, sans-serif",
                                  fontWeight: "bold",
                                }}
                                className=" text-[#07074D]"
                              >
                                Update Transaction Details
                              </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              <Form onSubmit={handleEditSubmit}>
                                <Form.Group
                                  className="mb-3"
                                  controlId="formName"
                                >
                                  <Form.Label
                                    style={{
                                      fontFamily: "San Francisco",
                                      fontWeight: "bold",
                                    }}
                                    className="mb-1 block text-base font-medium text-[#07074D]"
                                  >
                                    Transaction Name
                                  </Form.Label>
                                  <Form.Control
                                    name="title"
                                    type="text"
                                    className="w-full rounded-md border border-[#e0e0e0] bg-white py-2 px-4 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                    placeholder={editingTransaction[0].title}
                                    value={values.title}
                                    onChange={handleChange}
                                  />
                                </Form.Group>

                                <div className="mb-3 flex gap-3">
                                  <Form.Group
                                    className="w-1/2 mt-1 block text-base font-medium text-[#07074D]"
                                    controlId="formSelect"
                                    style={{
                                      fontFamily: "San Francisco",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    <Form.Label>Currency</Form.Label>
                                    <Form.Select
                                      name="currency"
                                      placeholder={
                                        editingTransaction[0].currency
                                      }
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
                                    style={{
                                      fontFamily: "San Francisco",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    <Form.Label>Amount</Form.Label>
                                    <Form.Control
                                      name="amount"
                                      type="number"
                                      placeholder={editingTransaction[0].amount}
                                      value={values.amount}
                                      onChange={handleChange}
                                    />
                                  </Form.Group>
                                </div>

                                <Form.Group
                                  className="mb-1 block text-base font-medium text-[#07074D]"
                                  controlId="formName"
                                  style={{
                                    fontFamily: "San Francisco",
                                    fontWeight: "bold",
                                  }}
                                >
                                  <Form.Label>Category</Form.Label>
                                  <Form.Control
                                    name="category"
                                    type="text"
                                    className="w-full mb-2 rounded-md border border-[#e0e0e0] bg-white py-2 px-4 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                    placeholder="Add New Category"
                                    value={values.category}
                                    onChange={handleChange}
                                  />
                                </Form.Group>
                                <div class="flex items-center">
                                  <div class="flex-1 border-t-2 border-gray-200"></div>
                                  <span
                                    style={{
                                      fontFamily: "San Francisco",
                                      fontWeight: "bold",
                                    }}
                                    class="px-3 text-gray-500 bg-white"
                                  >
                                    OR choose from these
                                  </span>
                                  <div class="flex-1 border-t-2 border-gray-200"></div>
                                </div>
                                <div
                                  style={{
                                    fontFamily: "San Francisco",
                                    fontWeight: "bold",
                                  }}
                                  className="text-[#07074D] font-semibold"
                                >
                                  Available Categories
                                </div>
                                <div className="mt-2">
                                  {dbCategories.map(
                                    (category, index) =>
                                      index % 4 === 0 && (
                                        <div
                                          key={index}
                                          className="d-flex flex-wrap"
                                        >
                                          {dbCategories
                                            .slice(index, index + 4)
                                            .map((category) => (
                                              <Button
                                                type="button"
                                                key={category._id}
                                                variant={
                                                  selectedCategory === category
                                                    ? "secondary"
                                                    : "outline-secondary"
                                                }
                                                onClick={() =>
                                                  handleCategorySelect(category)
                                                }
                                                className="me-2 mb-2 text-black"
                                                style={{
                                                  fontFamily: "San Francisco",
                                                  fontWeight: "bold",
                                                  width: "100px",
                                                }}
                                              >
                                                {category.name}
                                              </Button>
                                            ))}
                                        </div>
                                      )
                                  )}
                                </div>

                                <Form.Group
                                  className="mt-1 block text-base font-medium text-[#07074D]"
                                  controlId="formDescription"
                                  style={{
                                    fontFamily: "San Francisco",
                                    fontWeight: "bold",
                                  }}
                                >
                                  <Form.Label>Description</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="description"
                                    className="w-full mb-2 rounded-md border border-[#e0e0e0] bg-white py-2 px-4 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                                    placeholder={
                                      editingTransaction[0].description
                                    }
                                    value={values.description}
                                    onChange={handleChange}
                                  />
                                </Form.Group>

                                <Form.Group
                                  className="mt-1 block text-base font-medium text-[#07074D]"
                                  controlId="formSelect1"
                                  style={{
                                    fontFamily: "San Francisco",
                                    fontWeight: "bold",
                                  }}
                                >
                                  <Form.Label>Transaction Type</Form.Label>
                                  <Form.Select
                                    name="transactionType"
                                    value={values.transactionType}
                                    onChange={handleChange}
                                  >
                                    <option
                                      value={
                                        editingTransaction[0].transactionType
                                      }
                                    >
                                      {editingTransaction[0].transactionType}
                                    </option>
                                    <option value="credit">Income</option>
                                    <option value="expense">Expense</option>
                                  </Form.Select>
                                </Form.Group>

                                <Form.Group
                                  className="mt-1 block text-base font-medium text-[#07074D]"
                                  controlId="formDate"
                                  style={{
                                    fontFamily: "San Francisco",
                                    fontWeight: "bold",
                                  }}
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
                            </Modal.Body>
                            <Modal.Footer>
                              <Button
                                variant="outline-danger"
                                onClick={handleClose}
                                style={{
                                  fontFamily: "San Francisco",
                                  fontWeight: "bold",
                                }}
                              >
                                Close
                              </Button>
                              <Button
                                variant="outline-success"
                                type="submit"
                                onClick={handleEditSubmit}
                                style={{
                                  fontFamily: "San Francisco",
                                  fontWeight: "bold",
                                }}
                              >
                                Submit
                              </Button>
                            </Modal.Footer>
                          </Modal>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="d-flex justify-content-end mb-3">
          <button
            onClick={exportToExcel}
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center "
            style={{
              fontFamily: "San Francisco",
              fontWeight: "bold",
            }}
          >
            <svg
              class="fill-current w-4 h-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
            </svg>
            <span
              style={{
                fontFamily: "San Francisco",
                fontWeight: "bold",
              }}
            >
              Download
            </span>
          </button>
        </div>
      </Container>
    </>
  );
};

export default TableData;

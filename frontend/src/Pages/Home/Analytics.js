import { React, useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import CircularProgressBar from "../../components/CircularProgressBar";
import LineProgressBar from "../../components/LineProgressBar";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { getAllCategories } from "../../utils/ApiRequest";

const Analytics = ({ transactions, categories }) => {
  const TotalTransactions = transactions.length;
  const totalIncomeTransactions = transactions.filter(
    (item) => item.transactionType === "credit"
  );
  const totalExpenseTransactions = transactions.filter(
    (item) => item.transactionType === "expense"
  );

  let totalIncomePercent =
    (totalIncomeTransactions.length / TotalTransactions) * 100;
  let totalExpensePercent =
    (totalExpenseTransactions.length / TotalTransactions) * 100;

  const totalTurnOver = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );
  const totalTurnOverIncome = transactions
    .filter((item) => item.transactionType === "credit")
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const totalTurnOverExpense = transactions
    .filter((item) => item.transactionType === "expense")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const TurnOverIncomePercent = (totalTurnOverIncome / totalTurnOver) * 100;
  const TurnOverExpensePercent = (totalTurnOverExpense / totalTurnOver) * 100;

  // const categories = [
  //   "Groceries",
  //   "Rent",
  //   "Salary",
  //   "Tip",
  //   "Food",
  //   "Medical",
  //   "Utilities",
  //   "Entertainment",
  //   "Transportation",
  //   "Other",
  // ];
  // const categories = transactions.category;

  const colors = {
    Groceries: "#FF6384",
    Rent: "#36A2EB",
    Salary: "#FFCE56",
    Tip: "#4BC0C0",
    Food: "#9966FF",
    Medical: "#FF9F40",
    Utilities: "#8AC926",
    Entertainment: "#6A4C93",
    Transportation: "#1982C4",
    Other: "#F45B69",
  };
  const generateRandomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };
  const [dbCategories, setdbCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories(); // Fetch categories from backend
        setdbCategories(response.data.categories); // Assuming response.data.categories is an array of category names
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <Container className="mt-5 ">
        <Row>
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-black text-white">
                <span
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  Total Transactions :{" "}
                </span>{" "}
                {TotalTransactions}
              </div>
              <div className="card-body">
                <h5
                  className="card-title "
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                    color: "green",
                  }}
                >
                  Income : <ArrowDropUpIcon />
                  {totalIncomeTransactions.length}
                </h5>
                <h5
                  className="card-title"
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                    color: "red",
                  }}
                >
                  Expense : <ArrowDropDownIcon />
                  {totalExpenseTransactions.length}
                </h5>

                <div className="d-flex justify-content-center mt-3">
                  <CircularProgressBar
                    percentage={totalIncomePercent.toFixed(0)}
                    color="green"
                  />
                </div>

                <div className="d-flex justify-content-center mt-4 mb-2">
                  <CircularProgressBar
                    percentage={totalExpensePercent.toFixed(0)}
                    color="red"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-black text-white ">
                <span
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  Total TurnOver :{" "}
                </span>{" "}
                {totalTurnOver}
              </div>
              <div className="card-body">
                <h5
                  className="card-title"
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                    color: "green",
                  }}
                >
                  Income: <ArrowDropUpIcon /> {totalTurnOverIncome}{" "}
                  <CurrencyRupeeIcon />
                </h5>
                <h5
                  className="card-title"
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                    color: "red",
                  }}
                >
                  Expense: <ArrowDropDownIcon />
                  {totalTurnOverExpense} <CurrencyRupeeIcon />
                </h5>
                <div className="d-flex justify-content-center mt-3">
                  <CircularProgressBar
                    percentage={TurnOverIncomePercent.toFixed(0)}
                    color="green"
                  />
                </div>

                <div className="d-flex justify-content-center mt-4 mb-4">
                  <CircularProgressBar
                    percentage={TurnOverExpensePercent.toFixed(0)}
                    color="red"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header  bg-black text-white">
                <span
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  Categorywise Income
                </span>{" "}
              </div>
              <div
                className="card-body"
                style={{
                  fontFamily: "San Francisco",
                  fontWeight: "bold",
                }}
              >
                {categories.map((category) => {
                  const income = transactions
                    .filter(
                      (transaction) =>
                        transaction.transactionType === "credit" &&
                        transaction.category === category
                    )
                    .reduce((acc, transaction) => acc + transaction.amount, 0);

                  const incomePercent = (income / totalTurnOver) * 100;

                  return (
                    <>
                      {income > 0 && (
                        <LineProgressBar
                          label={category}
                          percentage={incomePercent.toFixed(0)}
                          lineColor={generateRandomColor()}
                        />
                      )}
                    </>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header  bg-black text-white">
                <span
                  style={{
                    fontFamily: "San Francisco",
                    fontWeight: "bold",
                  }}
                >
                  Categorywise Expense
                </span>{" "}
              </div>
              <div
                className="card-body"
                style={{
                  fontFamily: "San Francisco",
                  fontWeight: "bold",
                }}
              >
                {categories.map((category) => {
                  const expenses = transactions
                    .filter(
                      (transaction) =>
                        transaction.transactionType === "expense" &&
                        transaction.category === category
                    )
                    .reduce((acc, transaction) => acc + transaction.amount, 0);

                  const expensePercent = (expenses / totalTurnOver) * 100;

                  return (
                    <>
                      {expenses > 0 && (
                        <LineProgressBar
                          label={category}
                          percentage={expensePercent.toFixed(0)}
                          lineColor={colors[category]}
                        />
                      )}
                    </>
                  );
                })}
              </div>
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Analytics;

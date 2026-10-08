import { useEffect, useState } from "react";
import {
  insertCustomer,
  insertLoan,
  loadFinanceData,
  updateLoanStatus,
  updatePaymentStatus
} from "./lib/financeApi";
import { isSupabaseConfigured } from "./lib/supabase";
import "./App.css";

const customersData = [
  { id: "CUS001", name: "Rahul Sharma", phone: "+91 9876543210", email: "rahul@gmail.com", type: "Personal", status: "Active" },
  { id: "CUS002", name: "Priya Verma", phone: "+91 9123456780", email: "priya@gmail.com", type: "Home Loan", status: "Active" },
  { id: "CUS003", name: "Arjun Mehta", phone: "+91 9988776655", email: "arjun@gmail.com", type: "Business", status: "Active" }
];

const loansData = [
  { id: "LN1001", customer: "Rahul Sharma", customerId: "CUS001", amount: 250000, type: "Personal Loan", date: "08 Oct 2026", status: "Pending" },
  { id: "LN1002", customer: "Priya Verma", customerId: "CUS002", amount: 850000, type: "Home Loan", date: "07 Oct 2026", status: "Approved" },
  { id: "LN1003", customer: "Arjun Mehta", customerId: "CUS003", amount: 500000, type: "Business Loan", date: "05 Oct 2026", status: "Rejected" },
  { id: "LN1004", customer: "Sneha Patel", customerId: "CUS004", amount: 350000, type: "Education Loan", date: "04 Oct 2026", status: "Approved" }
];

const paymentsData = [
  { id: "PAY001", loanId: "LN1002", customer: "Priya Verma", amount: 25000, date: "08 Oct 2026", status: "Paid" },
  { id: "PAY002", loanId: "LN1004", customer: "Sneha Patel", amount: 15000, date: "07 Oct 2026", status: "Paid" },
  { id: "PAY003", loanId: "LN1001", customer: "Rahul Sharma", amount: 10000, date: "06 Oct 2026", status: "Pending" }
];

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();

    if (email === "admin@finmanage.com" && password === "Admin@123") {
      onLogin();
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">₹</div>

        <h1>Welcome Back</h1>
        <p className="login-subtitle">Sign in to FinManage</p>

        <form onSubmit={submit}>
          <div className="login-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="admin@finmanage.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error">⚠️ {error}</div>}

          <button className="login-btn" type="submit">
            Sign In
          </button>
        </form>

        <div className="demo-login">
          <strong>Demo Login</strong>
          <span>admin@finmanage.com</span>
          <span>Admin@123</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("Dashboard");

  const [customers, setCustomers] = useState(customersData);
  const [loans, setLoans] = useState(loansData);
  const [payments, setPayments] = useState(paymentsData);

  const [loanForm, setLoanForm] = useState({
    customer: "",
    customerId: "",
    amount: "",
    type: "Personal Loan"
  });

  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    type: "Personal"
  });

  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    if (!loggedIn || !isSupabaseConfigured) {
      return undefined;
    }

    let active = true;

    loadFinanceData()
      .then((data) => {
        if (!active) {
          return;
        }

        setCustomers(data.customers);
        setLoans(data.loans);
        setPayments(data.payments);
        setDataError("");
      })
      .catch((error) => {
        if (active) {
          console.error("Unable to load Supabase data", error);
          setDataError("Supabase data could not be loaded. Showing demo data.");
        }
      });

    return () => {
      active = false;
    };
  }, [loggedIn]);

  const reportPersistenceError = (error) => {
    console.error("Unable to save Supabase data", error);
    setDataError("Supabase could not save that change. Please try again.");
  };

  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);

  const totalLoans = loans.reduce((a, b) => a + b.amount, 0);
  const approved = loans.filter((x) => x.status === "Approved");
  const pending = loans.filter((x) => x.status === "Pending");

  const received = payments
    .filter((x) => x.status === "Paid")
    .reduce((a, b) => a + b.amount, 0);

  const pendingAmount = payments
    .filter((x) => x.status === "Pending")
    .reduce((a, b) => a + b.amount, 0);

  const approveLoan = (id) => {
    setLoans((old) =>
      old.map((loan) =>
        loan.id === id ? { ...loan, status: "Approved" } : loan
      )
    );

    if (isSupabaseConfigured) {
      void updateLoanStatus(id, "Approved").catch(reportPersistenceError);
    }
  };

  const rejectLoan = (id) => {
    setLoans((old) =>
      old.map((loan) =>
        loan.id === id ? { ...loan, status: "Rejected" } : loan
      )
    );

    if (isSupabaseConfigured) {
      void updateLoanStatus(id, "Rejected").catch(reportPersistenceError);
    }
  };

  const payLoan = (id) => {
    setPayments((old) =>
      old.map((payment) =>
        payment.id === id ? { ...payment, status: "Paid" } : payment
      )
    );

    if (isSupabaseConfigured) {
      void updatePaymentStatus(id, "Paid").catch(reportPersistenceError);
    }
  };

  const addLoan = (e) => {
    e.preventDefault();

    if (!loanForm.customer || !loanForm.customerId || !loanForm.amount) {
      alert("Fill all details");
      return;
    }

    const loan = {
      id: `LN${1001 + loans.length}`,
      customer: loanForm.customer,
      customerId: loanForm.customerId,
      amount: Number(loanForm.amount),
      type: loanForm.type,
      date: "08 Oct 2026",
      status: "Pending"
    };

    setLoans((old) => [loan, ...old]);

    if (isSupabaseConfigured) {
      void insertLoan(loan).catch(reportPersistenceError);
    }

    setLoanForm({
      customer: "",
      customerId: "",
      amount: "",
      type: "Personal Loan"
    });

    setShowLoanForm(false);
  };

  const addCustomer = (e) => {
    e.preventDefault();

    if (!customerForm.name || !customerForm.phone || !customerForm.email) {
      alert("Fill all details");
      return;
    }

    const customer = {
      id: `CUS${String(customers.length + 1).padStart(3, "0")}`,
      ...customerForm,
      status: "Active"
    };

    setCustomers((old) => [customer, ...old]);

    if (isSupabaseConfigured) {
      void insertCustomer(customer).catch(reportPersistenceError);
    }

    setCustomerForm({
      name: "",
      phone: "",
      email: "",
      type: "Personal"
    });

    setShowCustomerForm(false);
  };

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  const menu = [
    ["Dashboard", "▦"],
    ["Loan Applications", "▤"],
    ["Approvals", "✓"],
    ["Payments", "₹"],
    ["Customers", "♙"]
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">₹</div>
          <div>
            <h2>FinManage</h2>
            <span>Loan Management</span>
          </div>
        </div>

        <div className="menu-title">MAIN MENU</div>

        <nav>
          {menu.map(([name, icon]) => (
            <button
              key={name}
              className={`menu-item ${page === name ? "active" : ""}`}
              onClick={() => setPage(name)}
            >
              <span className="menu-icon">{icon}</span>
              {name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">AD</div>

            <div>
              <strong>Admin</strong>
              <span>Finance Manager</span>
            </div>

            <button
              className="logout-btn"
              onClick={() => setLoggedIn(false)}
            >
              ↪
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{page}</h1>
            <p>Manage your financial operations efficiently</p>
          </div>

          <div className="top-actions">
            <button className="notification">🔔</button>

            <div className="admin-name">
              <div className="small-avatar">AD</div>
              <div>
                <strong>Admin</strong>
                <small>Administrator</small>
              </div>
            </div>
          </div>
        </header>

        {dataError && <div className="data-error" role="status">{dataError}</div>}

        {page === "Dashboard" && (
          <section className="content">
            <div className="welcome">
              <div>
                <h2>Good morning, Admin 👋</h2>
                <p>Here's what's happening with your loan portfolio today.</p>
              </div>

              <button
                className="primary-btn"
                onClick={() => {
                  setPage("Loan Applications");
                  setShowLoanForm(true);
                }}
              >
                + New Loan Application
              </button>
            </div>

            <div className="stats-grid">
              <Stat title="Total Loans" value={money(totalLoans)} icon="₹" type="blue" />
              <Stat title="Approved Loans" value={approved.length} icon="✓" type="green" />
              <Stat title="Pending Approval" value={pending.length} icon="⏳" type="orange" />
              <Stat title="Payments Received" value={money(received)} icon="₹" type="purple" />
            </div>

            <div className="dashboard-grid">
              <div className="panel">
                <PanelTitle
                  title="Recent Loan Applications"
                  subtitle="Latest applications submitted"
                />

                <LoanTable
                  loans={loans.slice(0, 4)}
                  approve={approveLoan}
                  reject={rejectLoan}
                  money={money}
                />
              </div>

              <div className="panel">
                <PanelTitle
                  title="Payment Overview"
                  subtitle="Recent payment activity"
                />

                <div className="payment-summary">
                  <div>
                    <span>Total received</span>
                    <strong>{money(received)}</strong>
                  </div>

                  <div>
                    <span>Pending</span>
                    <strong>{money(pendingAmount)}</strong>
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-label">
                    <span>Monthly collection</span>
                    <strong>78%</strong>
                  </div>

                  <div className="progress">
                    <div style={{ width: "78%" }} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {page === "Loan Applications" && (
          <section className="content">
            <PageHeader
              title="Loan Applications"
              subtitle="Create and manage customer loan applications."
              button="+ New Application"
              action={() => setShowLoanForm(true)}
            />

            {showLoanForm && (
              <div className="form-panel">
                <h3>Create Loan Application</h3>

                <form onSubmit={addLoan}>
                  <div className="form-grid">
                    <Input
                      label="Customer Name"
                      value={loanForm.customer}
                      onChange={(e) =>
                        setLoanForm({
                          ...loanForm,
                          customer: e.target.value
                        })
                      }
                    />

                    <Input
                      label="Customer ID"
                      value={loanForm.customerId}
                      onChange={(e) =>
                        setLoanForm({
                          ...loanForm,
                          customerId: e.target.value
                        })
                      }
                    />

                    <Input
                      label="Loan Amount"
                      type="number"
                      value={loanForm.amount}
                      onChange={(e) =>
                        setLoanForm({
                          ...loanForm,
                          amount: e.target.value
                        })
                      }
                    />

                    <div className="form-group">
                      <label>Loan Type</label>

                      <select
                        value={loanForm.type}
                        onChange={(e) =>
                          setLoanForm({
                            ...loanForm,
                            type: e.target.value
                          })
                        }
                      >
                        <option>Personal Loan</option>
                        <option>Home Loan</option>
                        <option>Business Loan</option>
                        <option>Education Loan</option>
                        <option>Vehicle Loan</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => setShowLoanForm(false)}
                    >
                      Cancel
                    </button>

                    <button className="primary-btn">
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="panel full-panel">
              <PanelTitle
                title="All Applications"
                subtitle={`${loans.length} applications found`}
              />

              <LoanTable
                loans={loans}
                approve={approveLoan}
                reject={rejectLoan}
                money={money}
              />
            </div>
          </section>
        )}

        {page === "Approvals" && (
          <section className="content">
            <PageHeader
              title="Loan Approvals"
              subtitle="Review pending loan applications and make decisions."
            />

            <div className="approval-grid">
              {pending.map((loan) => (
                <div className="approval-card" key={loan.id}>
                  <div className="approval-top">
                    <div className="loan-circle">₹</div>
                    <span className="status pending">Pending</span>
                  </div>

                  <h3>{loan.type}</h3>
                  <p className="customer-name">{loan.customer}</p>

                  <div className="approval-amount">
                    {money(loan.amount)}
                  </div>

                  <div className="approval-info">
                    <span>Application ID</span>
                    <strong>{loan.id}</strong>
                  </div>

                  <div className="approval-info">
                    <span>Submitted</span>
                    <strong>{loan.date}</strong>
                  </div>

                  <div className="approval-actions">
                    <button
                      className="approve-btn"
                      onClick={() => approveLoan(loan.id)}
                    >
                      ✓ Approve
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => rejectLoan(loan.id)}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pending.length === 0 && (
              <div className="empty">
                <div>✓</div>
                <h3>No pending approvals</h3>
                <p>All loan applications have been reviewed.</p>
              </div>
            )}
          </section>
        )}

        {page === "Payments" && (
          <section className="content">
            <PageHeader
              title="Payment Management"
              subtitle="Track loan repayments and payment status."
            />

            <div className="stats-grid">
              <Stat title="Total Received" value={money(received)} icon="₹" type="green" />
              <Stat title="Total Payments" value={payments.length} icon="#" type="blue" />
              <Stat
                title="Pending Payments"
                value={payments.filter((x) => x.status === "Pending").length}
                icon="⏳"
                type="orange"
              />
              <Stat title="Pending Amount" value={money(pendingAmount)} icon="₹" type="purple" />
            </div>

            <div className="panel full-panel">
              <PanelTitle
                title="Payment Transactions"
                subtitle="Recent repayment records"
              />

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Loan ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td><strong>{payment.id}</strong></td>
                        <td>{payment.loanId}</td>
                        <td>{payment.customer}</td>
                        <td><strong>{money(payment.amount)}</strong></td>
                        <td>{payment.date}</td>

                        <td>
                          <span className={`status ${payment.status.toLowerCase()}`}>
                            {payment.status}
                          </span>
                        </td>

                        <td>
                          {payment.status === "Pending" ? (
                            <button
                              className="pay-btn"
                              onClick={() => payLoan(payment.id)}
                            >
                              Mark Paid
                            </button>
                          ) : (
                            <span className="completed">✓ Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {page === "Customers" && (
          <section className="content">
            <PageHeader
              title="Customer Records"
              subtitle="Manage customer information and loan relationships."
              button="+ Add Customer"
              action={() => setShowCustomerForm(true)}
            />

            {showCustomerForm && (
              <div className="form-panel">
                <h3>Add New Customer</h3>

                <form onSubmit={addCustomer}>
                  <div className="form-grid">
                    <Input
                      label="Full Name"
                      value={customerForm.name}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          name: e.target.value
                        })
                      }
                    />

                    <Input
                      label="Phone Number"
                      value={customerForm.phone}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          phone: e.target.value
                        })
                      }
                    />

                    <Input
                      label="Email"
                      type="email"
                      value={customerForm.email}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          email: e.target.value
                        })
                      }
                    />

                    <div className="form-group">
                      <label>Customer Type</label>

                      <select
                        value={customerForm.type}
                        onChange={(e) =>
                          setCustomerForm({
                            ...customerForm,
                            type: e.target.value
                          })
                        }
                      >
                        <option>Personal</option>
                        <option>Home Loan</option>
                        <option>Business</option>
                        <option>Education</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => setShowCustomerForm(false)}
                    >
                      Cancel
                    </button>

                    <button className="primary-btn">
                      Save Customer
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="customer-grid">
              {customers.map((customer) => (
                <div className="customer-card" key={customer.id}>
                  <div className="customer-top">
                    <div className="customer-avatar">
                      {customer.name
                        .split(" ")
                        .map((x) => x[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <span className="status approved">
                      {customer.status}
                    </span>
                  </div>

                  <h3>{customer.name}</h3>
                  <p>{customer.id}</p>

                  <div className="customer-details">
                    <span>📞 {customer.phone}</span>
                    <span>✉ {customer.email}</span>
                    <span>💼 {customer.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ title, value, icon, type }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${type}`}>{icon}</div>
      </div>

      <h2>{value}</h2>
    </div>
  );
}

function PanelTitle({ title, subtitle }) {
  return (
    <div className="panel-header">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, button, action }) {
  return (
    <div className="page-heading">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      {button && (
        <button className="primary-btn" onClick={action}>
          {button}
        </button>
      )}
    </div>
  );
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        required
      />
    </div>
  );
}

function LoanTable({ loans, approve, reject, money }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Application</th>
            <th>Customer</th>
            <th>Loan Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td><strong>{loan.id}</strong></td>

              <td>
                <div className="customer-cell">
                  <div className="mini-avatar">
                    {loan.customer
                      .split(" ")
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div>
                    <strong>{loan.customer}</strong>
                    <small>{loan.customerId}</small>
                  </div>
                </div>
              </td>

              <td>{loan.type}</td>

              <td><strong>{money(loan.amount)}</strong></td>

              <td>{loan.date}</td>

              <td>
                <span className={`status ${loan.status.toLowerCase()}`}>
                  {loan.status}
                </span>
              </td>

              <td>
                {loan.status === "Pending" ? (
                  <div className="table-actions">
                    <button
                      className="icon-action approve"
                      onClick={() => approve(loan.id)}
                    >
                      ✓
                    </button>

                    <button
                      className="icon-action reject"
                      onClick={() => reject(loan.id)}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
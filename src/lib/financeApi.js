import { supabase } from "./supabase";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  return supabase;
}

function throwOnError(result) {
  if (result.error) {
    throw result.error;
  }

  return result.data;
}

function mapCustomer(customer) {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    type: customer.type,
    status: customer.status
  };
}

function mapLoan(loan) {
  return {
    id: loan.id,
    customer: loan.customer,
    customerId: loan.customer_id,
    amount: Number(loan.amount),
    type: loan.type,
    date: loan.date,
    status: loan.status
  };
}

function mapPayment(payment) {
  return {
    id: payment.id,
    loanId: payment.loan_id,
    customer: payment.customer,
    amount: Number(payment.amount),
    date: payment.date,
    status: payment.status
  };
}

export async function loadFinanceData() {
  const client = requireSupabase();
  const [customers, loans, payments] = await Promise.all([
    client.from("customers").select("*").order("created_at", { ascending: false }),
    client.from("loans").select("*").order("created_at", { ascending: false }),
    client.from("payments").select("*").order("created_at", { ascending: false })
  ]);

  return {
    customers: throwOnError(customers).map(mapCustomer),
    loans: throwOnError(loans).map(mapLoan),
    payments: throwOnError(payments).map(mapPayment)
  };
}

export async function insertCustomer(customer) {
  const client = requireSupabase();
  throwOnError(await client.from("customers").insert({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    type: customer.type,
    status: customer.status
  }));
}

export async function insertLoan(loan) {
  const client = requireSupabase();
  throwOnError(await client.from("loans").insert({
    id: loan.id,
    customer: loan.customer,
    customer_id: loan.customerId,
    amount: loan.amount,
    type: loan.type,
    date: loan.date,
    status: loan.status
  }));
}

export async function updateLoanStatus(id, status) {
  const client = requireSupabase();
  throwOnError(await client.from("loans").update({ status }).eq("id", id));
}

export async function updatePaymentStatus(id, status) {
  const client = requireSupabase();
  throwOnError(await client.from("payments").update({ status }).eq("id", id));
}
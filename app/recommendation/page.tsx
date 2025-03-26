"use client";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function LoanRecommendation() {
  const [income, setIncome] = useState("");
  const [age, setAge] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [recommendation, setRecommendation] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulasi hasil dari Decision Tree (nanti bisa diganti dengan API ML sesungguhnya)
    let recommendedProduct = "";
    if (income > 5000000 && loanPurpose === "business") {
      recommendedProduct = "Business Loan - Low Interest";
    } else if (income < 5000000 && loanPurpose === "personal") {
      recommendedProduct = "Personal Loan - Standard Rate";
    } else {
      recommendedProduct = "Flexible Loan Plan";
    }

    setRecommendation(recommendedProduct);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center text-primary mb-4">Loan Product Recommendation</h2>

      <form className="p-4 border rounded bg-light shadow-sm" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Income (IDR)</label>
          <input
            type="number"
            className="form-control"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Age</label>
          <input
            type="number"
            className="form-control"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Loan Purpose</label>
          <select className="form-select" value={loanPurpose} onChange={(e) => setLoanPurpose(e.target.value)} required>
            <option value="">Select Purpose</option>
            <option value="business">Business</option>
            <option value="personal">Personal</option>
            <option value="education">Education</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary w-100">Get Recommendation</button>
      </form>

      {recommendation && (
        <div className="mt-4 p-3 border rounded bg-white shadow-sm">
          <h5 className="text-success">Recommended Loan Product:</h5>
          <p className="fs-5">{recommendation}</p>
        </div>
      )}
    </div>
  );
}

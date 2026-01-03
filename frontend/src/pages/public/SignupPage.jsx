import { useState } from "react";
import api from "../../services/api";

const SignupPage = () => {
  const [form, setForm] = useState({
    company_name: "",
    email: "",
    password: ""
  });

  const submit = async () => {
    await api.post("/auth/signup/", form);
    alert("Account created. Please login.");
  };

  return (
    <div>
      <h2>Create Your Company</h2>

      <input
        placeholder="Company Name"
        onChange={e => setForm({ ...form, company_name: e.target.value })}
      />

      <input
        placeholder="Admin Email"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={submit}>Create Account</button>
    </div>
  );
};

export default SignupPage;

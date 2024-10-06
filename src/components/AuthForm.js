"use client";
import { useState } from "react";

const AuthForm = ({ title, onSubmit, isSubmitting, error, isRegister }) => {
  const [formData, setFormData] = useState({
    name: "", // Include name in form state
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Calls the submit handler passed down as a prop
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-md shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required={isRegister} // Required only for registration
              placeholder="Enter your name"
              className="w-full px-4 py-2 border rounded-md text-gray-900"
            />
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-md text-gray-900"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="w-full px-4 py-2 border rounded-md text-gray-900"
          />
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 focus:outline-none ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : title}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "../../components/AuthForm";
import { registerUser } from "../../utils/api";

const RegisterPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleRegister = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const data = await registerUser(formData); // Send name, email, password
      router.push("/login"); // Redirect to login after successful registration
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Register"
      onSubmit={handleRegister}
      isSubmitting={isSubmitting}
      error={error}
      isRegister={true} // Pass this to show name input in registration
    />
  );
};

export default RegisterPage;

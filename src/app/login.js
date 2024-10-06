import { useState } from "react";
import { useRouter } from "next/router";
import AuthForm from "../components/AuthForm";
import { loginUser } from "../utils/api";
import { setToken } from "../utils/auth";

const LoginPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const data = await loginUser(formData);
      setToken(data.token); // Save token to localStorage
      router.push("/profile"); // Redirect to profile page
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Login"
      onSubmit={handleLogin}
      isSubmitting={isSubmitting}
      error={error}
      isRegister={true}
    />
  );
};

export default LoginPage;

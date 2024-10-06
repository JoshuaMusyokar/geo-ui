"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link for navigation
import AuthForm from "../../components/AuthForm";
import { loginUser } from "../../utils/api";
import { setToken } from "../../utils/auth";

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
      router.push("/"); // Redirect to homepage after login
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <AuthForm
        title="Login"
        onSubmit={handleLogin}
        isSubmitting={isSubmitting}
        error={error}
        isRegister={false}
      />

      {/* Add link for "Don't have an account? Register" */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register">
            <p className="text-blue-500 hover:underline">Register</p>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

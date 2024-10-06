// middleware.js (root of your app directory)
import { NextResponse } from "next/server";
import { getToken } from "../utils/auth"; // Assuming you're using next-auth for JWT

export async function middleware(req) {
  //   const token = req.cookies.get('token'); // Adjust if you store token elsewhere like localStorage
  const token = getToken();
  // If token does not exist, redirect to login page
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Define the routes where middleware should apply
export const config = {
  matcher: "/", // This will apply the middleware to your home page only
};

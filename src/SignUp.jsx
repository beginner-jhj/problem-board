import { useAuth } from "./context/AuthContext";
import { useState } from "react";
import { NavToHome } from "./App";
import { Link , useNavigate} from "react-router";
import ErrorAlert from "./ErrorAlert";
import { getErrorMessage } from "./utils/errorMessages";

export default function SignUp() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (email.length > 0 && password.length >= 6 && name.length > 0 ) {
        await signup(email, password, name);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      setError(getErrorMessage(error));
    }
  };
  return (
    <>
      <ErrorAlert isOpen={error.length > 0} message={error} />
      <header className="w-screen h-[50px] flex items-center justify-between px-4 py-2">
        <NavToHome />
      </header>
      <main className="w-screen h-[calc(100vh-50px)] p-4 flex flex-col items-center justify-center gap-2">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        <form
          onSubmit={handleSubmit}
          className="w-1/2 flex flex-col gap-2 mb-20"
        >
          <input
            type="email"
            placeholder="email"
            className="p-2 border border-gray-300 rounded-md"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="name"
            className="p-2 border border-gray-300 rounded-md"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            className="p-2 border border-gray-300 rounded-md"
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />
          <label>Password must be at least 6 characters</label>
          <Link to="/login" className="text-blue-500">
            Already have an account?
          </Link>
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-md"
          >
            Sign Up
          </button>
        </form>
      </main>
    </>
  );
}

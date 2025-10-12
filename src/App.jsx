import { Link } from "react-router";
import { useAuth } from "./context/AuthContext";
import { getAllDocs } from "./firebase/problemHandler";
import { useState, useEffect } from "react";

function App() {
  return (
    <>
      <header className="w-screen h-[50px] flex items-center justify-between px-4 py-2">
        <NavToHome/>
        <Link to="/post" className="rounded-md p-2 bg-blue-500 text-white">
          Post
        </Link>
      </header>
      <main className="w-screen h-[calc(100vh-50px)] grid grid-cols-[2fr_8fr] place-items-center">
        <MyInfo />
        <PostList />
      </main>
    </>
  );
}

export function NavToHome() {
  return (
    <Link to="/" className="flex flex-col items-start">
      <h1 className="text-2xl font-bold">Problem Board</h1>
      <p>Share your problems with others</p>
    </Link>
  );
}

function MyInfo() {
  const {user, logout} = useAuth();
  return (
    <div className="w-full h-full p-4 flex flex-col items-center justify-start">
      <h1 className="text-2xl">My Info</h1>
      <div className="w-full flex items-center justify-around">
        {user&&<Link className="rounded-md p-1 bg-blue-500 text-white" to="/login" onClick={logout}>{"Logout"}</Link>}
        {!user&&<Link className="rounded-md p-1 bg-blue-500 text-white" to="/login">{"Login"}</Link>}
        {!user&&<Link className="rounded-md p-1 bg-blue-500 text-white" to="/signup">{"Sign Up"}</Link>}
      </div>
      {user&&<p>Email:{user.email}</p>}
    </div>
  );
}

function PostList() {
  const [problems, setProblems] = useState([]);
  useEffect(() => {
    getAllDocs().then((problems) => setProblems(problems));
  }, []);
  return (
    <div className="w-full h-full flex flex-col justify-start items-center relative">
      <div className="flex gap-2 p-4 absolute top-0 right-0">
        <span className="category">All</span>
        <span className="category">General</span>
        <span className="category">Work</span>
        <span className="category">Health</span>
        <span className="category">Study</span>
        <span className="category">Finance</span>
        <select className="cursor-pointer">
          <option>Latest</option>
          <option>Likes</option>
          <option>Views</option>
        </select>
      </div>
      {problems.map((problem, index) => (
        <ProblemCard key={index} index={index} problem={problem} />
      ))}
    </div>
  );
}

function ProblemCard({index, problem}){
    return(
        <div className={`w-full h-[50px] flex items-center justify-start border border-gray-200 p-4 ${index === 0 ? "mt-12" : ""}`}>
            <h1 className="text-2xl">{index+1}</h1>
            <h1 className="text-2xl">{problem.title}</h1>
            <p>{problem.category}</p>
            <p>{problem.createdAt.toDate().toLocaleString()}</p>
            <p>{problem.views}</p>
            <p>{problem.empathy}</p>
        </div>
    );
}

export default App;

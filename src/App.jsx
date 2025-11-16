import { Link, useNavigate } from "react-router";
import { useAuth } from "./context/AuthContext";
import {
  getAllDocs,
  getDocsByCategory,
  getDocsByUserId,
} from "./firebase/problemHandler";
import { useState, useEffect } from "react";
import Loader from "./Loader";
import ErrorAlert from "./ErrorAlert";
import { timeCalc } from "./utils/timeAgo";
import { getErrorMessage } from "./utils/errorMessages";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="nav-bar">
        <div className="container w-full flex items-center justify-between gap-2">
          <NavToHome />
          <div className="flex items-center gap-2">
            <Link to="/profile" className="btn md:hidden">
              Profile
            </Link>
            <Link to="/post" className="btn btn-primary">
              Post
            </Link>
          </div>
        </div>
      </header>
      <main className="container grid grid-cols-1 gap-4 py-4 flex-1 md:grid-cols-[280px_1fr] md:gap-6">
        <div className="hidden md:block">
          <MyInfo />
        </div>
        <PostList />
      </main>
      <Footer />
    </div>
  );
}

export function NavToHome() {
  return (
    <Link to="/" className="flex flex-col items-start">
      <span className="brand">Problem Board</span>
      <span className="brand-sub">Real problems. Real solutions.</span>
    </Link>
  );
}

function MyInfo() {
  const { user, logout } = useAuth();
  const [myProblems, setMyProblems] = useState([]);
  useEffect(() => {
    if(user){
      getDocsByUserId(user.uid).then((problems) => {
        setMyProblems(problems);
      });
    }
  }, [user]);
  const navigate = useNavigate();
  return (
    <div className="card p-4 flex flex-col gap-3">
      <h2 className="text-lg font-semibold">My Info</h2>
      <div className="flex items-center gap-2">
        {user && (
          <Link className="btn" to="/login" onClick={logout}>
            {"Logout"}
          </Link>
        )}
        {!user && (
          <Link className="btn btn-primary" to="/login">
            {"Login"}
          </Link>
        )}
        {!user && (
          <Link className="btn" to="/signup">
            {"Sign Up"}
          </Link>
        )}
      </div>
      {user && <p className="muted text-sm">Email: {user.email} | Username: {user.displayName}</p>}
      <h3 className="text-lg font-medium">Problems ({myProblems.length})</h3>
      {user &&
        myProblems.map((problem, index) => (
          <div key={index} className="flex flex-col">
            <Link to={`/problem/${problem.id}`}>
              <h3 className="text-base">{problem.title.length>20?problem.title.slice(0,20)+'...':problem.title}</h3>
            </Link>
            <p className="muted text-sm">
              Views {problem.views} | Empathy {problem.empathy}{" "} | Watching {problem.watching}{" "}<span className="cursor-pointer" onClick={()=>navigate(`/edit/${problem.id}`)}>✎</span>
            </p>
          </div>
        ))}
    </div>
  );
}

function PostList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [error, setError] = useState("");
  useEffect(() => {
    getAllDocs()
      .then((problems) => {
        setProblems(problems);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);
  // Reset pagination when the problems list changes (e.g., filter/sort)
  useEffect(() => {
    setVisibleCount(10);
  }, [problems]);
  return (
    <div className="w-full flex flex-col gap-3">
      <ErrorAlert isOpen={error.length > 0} message={error} />
      <FilterNav setProblems={setProblems} setError={setError} />
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="card w-full">
          {problems.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="muted text-sm">No problems found</p>
            </div>
          ) : (
            problems.slice(0, visibleCount).map((problem, index) => (
              <ProblemCard key={index} index={index} problem={problem} />
            ))
          )}
        </div>
      )}
      {!loading && visibleCount < problems.length && (
        <div className="w-full flex items-center justify-center">
          <button
            className="btn"
            onClick={() => setVisibleCount((c) => Math.min(c + 10, problems.length))}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

function FilterNav({ setProblems, setError }) {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const fetch = category === "all" ? getAllDocs : () => getDocsByCategory(category);
    fetch()
      .then((problems) => {
        const filtered = status === "all" ? problems : problems.filter((p) => (p.status || "Open") === status);
        setProblems(filtered);
      })
      .catch((err) => setError && setError(getErrorMessage(err)));
  }, [category, status]);

  useEffect(() => {
    if (sort === "empathy") {
      setProblems((prev) => [...prev].sort((a, b) => b.empathy - a.empathy));
    } else if (sort === "views") {
      setProblems((prev) => [...prev].sort((a, b) => b.views - a.views));
    } else {
      setProblems((prev) =>
        [...prev].sort(
          (a, b) =>
            timeCalc(a.createdAt).seconds - timeCalc(b.createdAt).seconds
        )
      );
    }
  }, [sort]);

  return (
    <div className="w-full flex items-center justify-end">
      <div className="list-header">
        <span className="category" onClick={() => setCategory("all")}>
          All
        </span>
        <span className="category" onClick={() => setCategory("general")}>
          General
        </span>
        <span className="category" onClick={() => setCategory("work")}>
          Work
        </span>
        <span className="category" onClick={() => setCategory("health")}>
          Health
        </span>
        <span className="category" onClick={() => setCategory("study")}>
          Study
        </span>
        <span className="category" onClick={() => setCategory("finance")}>
          Finance
        </span>
        <span className="category" onClick={() => setStatus("all")}>
          Status: All
        </span>
        <span className="category" onClick={() => setStatus("Open")}>
          Open
        </span>
        <span className="category" onClick={() => setStatus("Trending")}>
          Trending
        </span>
        <span className="category" onClick={() => setStatus("Resolved")}>
          Resolved
        </span>
        <select
          className="base-input-design"
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="empathy">Empathy</option>
          <option value="views">Viewed</option>
        </select>
      </div>
    </div>
  );
}

function ProblemCard({ index, problem }) {
  return (
    <Link to={`/problem/${problem?.id}`} className="card-row">
      <div className="muted text-xs hidden sm:block">{index + 1}</div>
      <div className="flex flex-col gap-1 min-w-0">
        <h3 className="text-sm md:text-base font-medium leading-snug break-words min-w-0">
          {problem?.title}
        </h3>
        {problem?.status && (
          <div className="flex items-center gap-1">
            <span className="tag">{problem.status}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs md:text-sm flex-wrap justify-end">
        <span className="tag">{problem?.category}</span>
        <span title="Views" className="muted">Viewed {problem?.views}</span>
        <span title="Empathy" className="hidden md:inline muted">Empathy {problem?.empathy}</span>
        <span title="Watching" className="hidden md:inline muted">Watching {problem?.watching}</span>
        <span title="Created at" className="muted">{timeCalc(problem?.createdAt).text}</span>
      </div>
    </Link>
  );
}

export default App;

export function Footer() {
  return (
    <footer className="border-t surface mt-8">
      <div className="container py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="muted">© {new Date().getFullYear()} Problem Board</div>
        <nav className="flex flex-wrap items-center gap-3">
          <Link className="muted" to="/post">Post a Problem</Link>
          <Link className="muted" to="/">Browse Problems</Link>
          <Link className="muted" to="/login">Login / Sign Up</Link>
        </nav>
        <div>
          <a className="muted" href="mailto:problemboardfeedback@gmail.com">problemboardfeedback@gmail.com</a>
        </div>
      </div>
    </footer>
  );
}

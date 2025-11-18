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
import { Helmet } from 'react-helmet-async';
import { getErrorMessage } from "./utils/errorMessages";
import { getUnreadNotificationsCount } from "./firebase/notificationHandler";

function App() {
  const { user } = useAuth();
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [error, setError] = useState("");
  useEffect(()=>{
    if(!user)return;
    getUnreadNotificationsCount(user.uid).then((count)=>{
      setUnreadNotificationCount(count);
    }).catch((err)=>{
      setError(getErrorMessage(err));
    });
  },[])
  return (
    <>
      <ErrorAlert isOpen={error.length > 0} message={error} />
      <Helmet>
        <title>Problem Board - Find Real Problems to Solve</title>
        <meta name="description" content="Discover everyday problems that need solutions. Get inspiration for your next project by exploring real-world challenges." />

        <meta property="og:title" content="Problem Board" />
        <meta property="og:description" content="Find real-world problems to solve" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://theproblemboard.com" />
        <meta property="og:image" content="https://theproblemboard.com/og-image.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Problem Board" />
        <meta name="twitter:description" content="Find real-world problems to solve" />
        <meta name="twitter:image" content="https://theproblemboard.com/og-image.png" />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <header className="nav-bar">
          <div className="container w-full flex items-center justify-between gap-2">
            <NavToHome />
            <div className="flex items-center gap-2">
              <Link to={unreadNotificationCount > 0 ? '/profile/true':'/profile/false'} className="btn md:hidden">
                Profile
                {unreadNotificationCount > 0 && (
                  <span className="text-sm text-green-600 font-semibold ml-1">
                    🔔{unreadNotificationCount}
                  </span>
                )}
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
    </>
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
  const { user, logout, userProfile } = useAuth();
  const [myProblems, setMyProblems] = useState([]);
  useEffect(() => {
    if (user) {
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
              <h3 className="text-base">{problem.title.length > 20 ? problem.title.slice(0, 20) + '...' : problem.title}</h3>
            </Link>
            <p className="muted text-sm">
              Views {problem.views} | Empathy {problem.empathy}{" "} | Watching {problem.watching}{" "}<span className="cursor-pointer" onClick={() => navigate(`/edit/${problem.id}`)}>✎</span>
            </p>
          </div>
        ))}
      <h3 className="text-lg font-medium">Problems I solved ({userProfile.acceptedSolutions?.length || 0})</h3>
      {user &&
        (userProfile.acceptedSolutions?.length || 0) === 0 && (
          <p className="muted text-sm">You have not had any solutions accepted yet.</p>
        )}
      {user &&
        userProfile.acceptedSolutions?.length > 0 && (
          <div className="flex flex-col gap-2">
            {userProfile.acceptedSolutions.map((problemTitle, index) => (
              <div key={index} className="border-l-2 border-green-500 pl-3 py-1">
                <p className="text-sm font-medium text-green-700">✓ Solution {index + 1}</p>
                <p className="text-sm text-gray-700">{problemTitle}</p>
              </div>
            ))}
          </div>
        )}
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
        <span className={`category-filter ${category === "all" ? "active" : ""}`} onClick={() => setCategory("all")}>
          All
        </span>
        <span className={`category-filter ${category === "general" ? "active" : ""}`} onClick={() => setCategory("general")}>
          General
        </span>
        <span className={`category-filter ${category === "work" ? "active" : ""}`} onClick={() => setCategory("work")}>
          Work
        </span>
        <span className={`category-filter ${category === "health" ? "active" : ""}`} onClick={() => setCategory("health")}>
          Health
        </span>
        <span className={`category-filter ${category === "study" ? "active" : ""}`} onClick={() => setCategory("study")}>
          Study
        </span>
        <span className={`category-filter ${category === "finance" ? "active" : ""}`} onClick={() => setCategory("finance")}>
          Finance
        </span>
        <span className={`category-filter ${status === "all" ? "active" : ""}`} onClick={() => setStatus("all")}>
          Status: All
        </span>
        <span className={`category-filter ${status === "Open" ? "active" : ""}`} onClick={() => setStatus("Open")}>
          Open
        </span>
        <span className={`category-filter ${status === "Trending" ? "active" : ""}`} onClick={() => setStatus("Trending")}>
          Trending
        </span>
        <span className={`category-filter ${status === "Resolved" ? "active" : ""}`} onClick={() => setStatus("Resolved")}>
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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="tag">{problem?.category}</span>
          {problem?.status && <span className="tag">{problem?.status}</span>}
        </div>
        <div className="flex items-center gap-3 text-xs md:text-sm flex-wrap muted">
          <span title="Views">Viewed {problem?.views}</span>
          <span title="Empathy">Empathy {problem?.empathy}</span>
          <span title="Watching">Watching {problem?.watching}</span>
          <span title="Created at">{timeCalc(problem?.createdAt).text}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs md:text-sm flex-wrap justify-end">
        {/* reserved for future actions/controls */}
      </div>
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t w-full py-3 mt-10 md:mt-20">
      <div className="container flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="muted">© {new Date().getFullYear()} Problem Board</div>
        <nav className="flex flex-wrap items-center gap-3">
          <Link className="muted" to="/about">About</Link>
          <Link className="muted" to="/post">Post a Problem</Link>
          <Link className="muted" to="/login">Login / Sign Up</Link>
        </nav>
        <div>
          <a className="muted" href="mailto:problemboardfeedback@gmail.com">problemboardfeedback@gmail.com</a>
        </div>
      </div>
    </footer>
  );
}


export default App;

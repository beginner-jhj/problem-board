import { useParams } from "react-router";
import { getDocById } from "./firebase/problemHandler";
import { useEffect, useState } from "react";
import ErrorAlert from "./ErrorAlert";
import { NavToHome } from "./App";
import Loader from "./Loader";
import { useAuth } from "./context/AuthContext";
import { increaseEmpathy, increaseView } from "./firebase/problemHandler";
import { useNavigate } from "react-router";

export default function ProblemDetail() {
  const { id } = useParams();
  const {user} = useAuth();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [empathized, setEmpathized] = useState(false);
  const [viewed, setViewed] = useState(false);

  useEffect(() => {
    const getProblem = async () => {
      try {
        const problem = await getDocById(id);
        setProblem(problem);
        if(problem?.empathizedBy.includes(user?.uid)){
          setEmpathized(true);
        }
        if(!problem?.viewsBy.includes(user?.uid) && user){
          setViewed(true);
          setProblem(prev=>({...prev, views: prev.views + 1}));
          increaseView(id, user.uid).catch(error => setError(error.message));
        }
        setLoading(false);
      } catch (error) {
        setError("Error reading document");
        setLoading(false);
      }
    };
    getProblem();
  }, [id, user]);
  
  
  return (
    <>
      <ErrorAlert isOpen={error.length > 0} message={error} />
      <header className="w-screen h-[50px] flex items-center justify-between px-4 py-2">
        <NavToHome />
      </header>
      <main className="w-screen h-[calc(100vh-50px)] p-4 flex flex-col gap-2 items-center justify-center">
        {loading && <Loader />}
        {!loading && (
          <>
            <h1 className="text-2xl font-bold">Problem Detail</h1>
            <div className="w-1/2 flex flex-col gap-2 mb-20">
              <h1>{problem?.title}</h1>
              <p>{problem?.description}</p>
              <p>{problem?.category}</p>
              <p>{problem?.frequency}</p>
              <ul>
                {problem?.features.map((feature,index)=>(
                  <li key={index}>{index+1}. {feature}</li>
                ))}
              </ul>
              <p>Created at:{problem?.createdAt.toDate().toLocaleString()}</p>
              <div className="flex items-center justify-between">
              <p>Empathized:{problem?.empathy}</p>
              <button disabled={empathized} onClick={() => {
                if(user && !empathized){
                  setEmpathized(true);
                  setProblem(prev=>({...prev, empathy: prev.empathy + 1}));
                  increaseEmpathy(id, user.uid).catch(error => setError(error.message));
                }else{
                  navigate("/login");
                }
              }} className="bg-blue-500 text-white px-4 py-2 rounded">Empathize</button>
              </div>
              <p>Views: {problem?.views}</p>
            </div>
          </>
        )}
      </main>
    </>
  );
}

import { NavToHome } from "./App";
import { useEffect, useState} from "react";
import { addProblem } from "./firebase/problemHandler";
import { useNavigate } from "react-router";
import { useAuth } from "./context/AuthContext";
import FeatureInput from "./components/FeatureInput";
import ErrorAlert from "./ErrorAlert";
import { getErrorMessage } from "./utils/errorMessages";

function PostProblem() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("");
  const [features, setFeatures] = useState([""]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState("");

  const addFeature = () => {
    
    setFeatures((prev)=>{
      return [...prev,""]
    })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!title || !description || !category || !frequency) {
        setError("Please fill in all required fields");
        return;
      }
      const docRef = await addProblem(
        {
          title,
          description,
          category,
          frequency,
          features,
        },
        user.uid
      );
      navigate(`/problem/${docRef.id}`);
    } catch (error) {
      console.error("Error adding problem:", error);
      setError(getErrorMessage(error));
    }
  };

  return (
    <>
      <ErrorAlert isOpen={error.length > 0} message={error} />
      <header className="w-screen h-[50px] flex items-center justify-between px-4 py-2">
        <NavToHome message="Share your problems with others" />
      </header>
      <main className="w-screen h-[calc(100vh-50px)] p-4 flex items-center justify-center">
        <form className="w-1/2 gap-2 flex flex-col mb-20">
          <div className="flex flex-col">
            <h1>*Title</h1>
            <input
            required
              autoFocus
              type="text"
              className="base-input-design"
              placeholder="eg) Every morning I worry about what to wear."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <h1>*Problem</h1>
            <textarea
            required
              className="base-input-design"
              placeholder="Please describe your problem specifically."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="flex flex-col">
            <h1>*Category</h1>
            <div className="flex gap-2">
              <input
                type="radio"
                name="category"
                value="general"
                onChange={(e) => setCategory(e.target.value)}
              />
              <label>General</label>
              <input
                type="radio"
                name="category"
                value="work"
                onChange={(e) => setCategory(e.target.value)}
              />
              <label>Work</label>
              <input
                type="radio"
                name="category"
                value="health"
                onChange={(e) => setCategory(e.target.value)}
              />
              <label>Health</label>
              <input
                type="radio"
                name="category"
                value="study"
                onChange={(e) => setCategory(e.target.value)}
              />
              <label>Study</label>
              <input
                type="radio"
                name="category"
                value="finance"
                onChange={(e) => setCategory(e.target.value)}
              />
              <label>Finance</label>
            </div>
          </div>
          <div className="flex flex-col">
            <h1>*How often?</h1>
            <div className="flex gap-2">
              <input
                type="radio"
                name="frequency"
                value="daily"
                onChange={(e) => setFrequency(e.target.value)}
              />
              <label>Dayily</label>
              <input
                type="radio"
                name="frequency"
                value="weekly"
                onChange={(e) => setFrequency(e.target.value)}
              />
              <label>Weekly</label>
              <input
                type="radio"
                name="frequency"
                value="monthly"
                onChange={(e) => setFrequency(e.target.value)}
              />
              <label>Monthly</label>
              <input
                type="radio"
                name="frequency"
                value="sometimes"
                onChange={(e) => setFrequency(e.target.value)}
              />
              <label>Sometimes</label>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1>Features you want</h1>
              <span onClick={addFeature} className="text-2xl text-center cursor-pointer">
                +
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {features.map((feature, index) => (
                <FeatureInput key={index} index={index + 1} setFeatures={setFeatures} features={features} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 muted text-sm">
            <span>Views: 0</span>
            <span>Empathy: 0</span>
            <span>Watching: 0</span>
          </div>
          <button
            className="p-2 bg-blue-500 text-white rounded-md"
            onClick={handleSubmit}
          >
            Post
          </button>
        </form>
      </main>
    </>
  );
}

export default PostProblem;

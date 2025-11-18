import { NavToHome } from "./App";
import { useEffect, useState} from "react";
import { addProblem } from "./firebase/problemHandler";
import { useNavigate } from "react-router";
import { useAuth } from "./context/AuthContext";
import FeatureInput from "./components/FeatureInput";
import ErrorAlert from "./ErrorAlert";
import { getErrorMessage } from "./utils/errorMessages";
import { Footer } from "./App";
import { Helmet } from 'react-helmet-async';

function PostProblem() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("");
  const [features, setFeatures] = useState([""]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addFeature = () => {
    
    setFeatures((prev)=>{
      return [...prev,""]
    })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!title || !description || !category || !frequency) {
        setError(getErrorMessage('validation/missing-fields'));
        return;
      }
      setSubmitting(true);
      const docRef = await addProblem(
        {
          title,
          description,
          category,
          frequency,
          features,
        },
        user.uid,
        user.displayName
      );
      navigate(`/problem/${docRef.id}`);
    } catch (error) {
      console.error("Error adding problem:", error);
      setError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Post a Problem — Problem Board</title>
        <meta name="description" content="Share a real problem and get feedback from the community on Problem Board." />
      </Helmet>
      <ErrorAlert isOpen={error.length > 0} message={error} />
      <header className="w-screen h-[50px] flex items-center justify-between px-4 py-2">
        <NavToHome message="Share your problems with others" />
      </header>
      <main className="w-screen h-[calc(100vh-50px)] p-4 flex items-center justify-center">
        <form className="w-full md:w-1/2 gap-2 flex flex-col mb-20 px-4">
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
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="category"
                  value="General"
                  onChange={(e) => setCategory(e.target.value)}
                />
                <span>General</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="category"
                  value="Work"
                  onChange={(e) => setCategory(e.target.value)}
                />
                <span>Work</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="category"
                  value="Health"
                  onChange={(e) => setCategory(e.target.value)}
                />
                <span>Health</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="category"
                  value="Study"
                  onChange={(e) => setCategory(e.target.value)}
                />
                <span>Study</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="category"
                  value="Finance"
                  onChange={(e) => setCategory(e.target.value)}
                />
                <span>Finance</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col">
            <h1>*How often?</h1>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="frequency"
                  value="Daily"
                  onChange={(e) => setFrequency(e.target.value)}
                />
                <span>Daily</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="frequency"
                  value="Weekly"
                  onChange={(e) => setFrequency(e.target.value)}
                />
                <span>Weekly</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="frequency"
                  value="Monthly"
                  onChange={(e) => setFrequency(e.target.value)}
                />
                <span>Monthly</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="frequency"
                  value="Sometimes"
                  onChange={(e) => setFrequency(e.target.value)}
                />
                <span>Sometimes</span>
              </label>
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
                <FeatureInput key={index} index={index + 1} setFeatures={setFeatures} features={feature} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 muted text-sm">
            <span>Views: 0</span>
            <span>Empathy: 0</span>
            <span>Watching: 0</span>
          </div>
          <button
            className="p-2 bg-blue-500 text-white rounded-md w-full md:w-auto mt-4"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}

export default PostProblem;

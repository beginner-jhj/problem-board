import { useEffect, useState } from "react";
import { getDocById, updateProblem, deleteProblem } from "./firebase/problemHandler";
import { useAuth } from "./context/AuthContext";
import { Link, useNavigate, useParams } from "react-router";
import FeatureInput from "./components/FeatureInput";
import { NavToHome, Footer } from "./App";
import Loader from "./Loader";
import ErrorAlert from "./ErrorAlert";
import { getErrorMessage } from "./utils/errorMessages";

export default function EditProblem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("");
  const [features, setFeatures] = useState([""]);
  const [loading, setLoading] = useState(true);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getDocById(id)
      .then((p) => {
        if (!p) return;
        if (!mounted) return;
        setTitle(p.title || "");
        setDescription(p.description || "");
        setCategory(p.category || "");
        setFrequency(p.frequency || "");
        setFeatures(Array.isArray(p.features) && p.features.length ? p.features : [""]);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const addFeature = () => setFeatures((prev) => [...prev, ""]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !frequency) {
      setError(getErrorMessage('validation/missing-fields'));
      return;
    }
    try {
      await updateProblem(id, { title, description, category, frequency, features });
      navigate(`/problem/${id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <ErrorAlert isOpen={error.length > 0} message={error} />
      <header className="nav-bar">
        <div className="container w-full flex items-center justify-between">
          <NavToHome />
          <Link to={`/problem/${id}`} className="btn">Cancel</Link>
        </div>
      </header>
      <main className="container py-6">
        {loading ? (
          <div className="w-full flex items-center justify-center"><Loader /></div>
        ) : (
          <form className="card p-5 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Edit Problem</h1>
              <button type="submit" className="btn btn-primary">Save changes</button>
            </div>

            <section className="flex flex-col gap-2">
              <label className="text-sm">Title</label>
              <input
                required
                type="text"
                className="base-input-design"
                placeholder="eg) Every morning I worry about what to wear."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </section>

            <section className="flex flex-col gap-2">
              <label className="text-sm">Problem</label>
              <textarea
                required
                className="base-input-design"
                placeholder="Please describe your problem specifically."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm">Category</label>
                <div className="flex gap-3 items-center flex-wrap">
                  {[
                    ["general", "General"],
                    ["work", "Work"],
                    ["health", "Health"],
                    ["study", "Study"],
                    ["finance", "Finance"],
                  ].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name="category"
                        value={val}
                        checked={category === val}
                        onChange={(e) => setCategory(e.target.value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm">How often?</label>
                <div className="flex gap-3 items-center flex-wrap">
                  {[
                    ["daily", "Daily"],
                    ["weekly", "Weekly"],
                    ["monthly", "Monthly"],
                    ["sometimes", "Sometimes"],
                  ].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name="frequency"
                        value={val}
                        checked={frequency === val}
                        onChange={(e) => setFrequency(e.target.value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-medium">Features you want</h2>
                <span onClick={addFeature} className="text-2xl text-center cursor-pointer">+</span>
              </div>
              <div className="flex flex-col gap-2">
                {features.map((_, index) => (
                  <FeatureInput
                    key={index}
                    index={index + 1}
                    setFeatures={setFeatures}
                    features={features}
                  />
                ))}
              </div>
            </section>

            <div className="flex items-center justify-end gap-2">
              <Link to={`/problem/${id}`} className="btn">Cancel</Link>
              <button type="submit" className="btn btn-primary">Save changes</button>
              <button type="button" className="btn btn-warn" onClick={()=>setOpenDeleteModal(true)}>Delete</button>
            </div>
          </form>
        )}
      </main>
      <DeleteConfirmModal id={id} open={openDeleteModal} setOpen={setOpenDeleteModal} setError={setError} />
    </>
  );
}

function DeleteConfirmModal({id, open=false, setOpen, setError}){
    const navigate = useNavigate();
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) {
      if (typeof setError === 'function') {
        setError('You must be logged in to delete this problem');
      }
      return;
    }
    try {
      setDeleting(true);
      await deleteProblem(id, user.uid);
      navigate("/");
    } catch (err) {
      console.error('Delete failed:', err);
      // Show a friendly message
      if (typeof setError === 'function') {
        setError(getErrorMessage(err));
      }
    } finally {
      setDeleting(false);
    }
  };
    return (
        <div className={`fixed top-0 left-0 right-0 bottom-0 z-50 w-full h-full flex items-center justify-center bg-black/50 ${open ? "flex" : "hidden"} p-4`}>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg flex flex-col gap-2 w-full md:max-w-sm">
                <p className="text-center text-sm md:text-base">Are you sure you want to delete this problem? <br/>This action cannot be undone.</p>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <button onClick={handleDelete} disabled={deleting} className="btn btn-warn w-full md:w-auto">{deleting ? 'Deleting...' : 'Yes'}</button>
                    <button onClick={()=>setOpen(false)} className="btn btn-primary w-full md:w-auto">No</button>
                </div>
            </div>
        </div>
    )
}
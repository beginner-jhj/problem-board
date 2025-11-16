import { useParams } from "react-router";
import { getDocById } from "./firebase/problemHandler";
import { addComment, getAllComments, toggleLike, toggleDislike, updateComment, deleteComment, toggleAccept } from "./firebase/commentHanler";
import { useEffect, useState } from "react";
import { Helmet } from 'react-helmet-async';
import ErrorAlert from "./ErrorAlert";
import { NavToHome, Footer } from "./App";
import Loader from "./Loader";
import { useAuth } from "./context/AuthContext";
import {
  toggleEmpathy,
  increaseView,
  toggleWatching,
} from "./firebase/problemHandler";
import { useNavigate } from "react-router";
import { timeCalc } from "./utils/timeAgo";
import { getErrorMessage } from "./utils/errorMessages";

export default function ProblemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [empathized, setEmpathized] = useState(false);
  const [viewed, setViewed] = useState(false);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    const getProblem = async () => {
      try {
        const problem = await getDocById(id);
        setProblem(problem);
        if (problem?.empathizedBy.includes(user?.uid)) {
          setEmpathized(true);
        }
        if (problem?.watchingBy?.includes(user?.uid)) {
          setWatched(true);
        }
        if (!problem?.viewsBy.includes(user?.uid) && user) {
          setViewed(true);
          setProblem((prev) => ({ ...prev, views: prev?.views + 1 }));
          increaseView(id, user.uid).catch((error) => setError(getErrorMessage(error)));
        }
        setLoading(false);
      } catch (error) {
        setError(getErrorMessage(error));
        setLoading(false);
      }
    };
    getProblem();
  }, [id, user]);


  return (
    <>
      {problem && (
        <Helmet>
          <title>{problem?.title} — Problem Board</title>
          <meta name="description" content={problem?.description ? problem.description.slice(0, 150) : 'Problem detail on Problem Board'} />
          <meta property="og:title" content={problem?.title} />
          <meta property="og:description" content={problem?.description ? problem.description.slice(0, 150) : ''} />
        </Helmet>
      )}
      <ErrorAlert isOpen={error.length > 0} message={error} />
      <header className="nav-bar">
        <div className="container w-full flex items-center justify-between">
          <NavToHome />
        </div>
      </header>
      <main className="container py-6">
        {loading && (
          <div className="w-full flex items-center justify-center">
            <Loader />
          </div>
        )}
        {!loading && (
          <div className="card p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold">{problem?.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="tag">{problem?.category}</span>
                  {problem?.frequency && (
                    <span className="tag">{problem?.frequency}</span>
                  )}
                  {problem?.status && (
                    <span className="tag">{problem.status}</span>
                  )}
                </div>
              </div>
              <div className="text-sm muted flex flex-col items-start md:items-end gap-1">
                <span className="line-clamp-2">
                  Posted by {problem?.userName || "Unknown"} | Created{" "}
                  {problem?.createdAt?.toDate().toLocaleString()}
                </span>
                <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                  <span title="Views">View {problem?.views}</span>
                  <span title="Empathy">Empathy {problem?.empathy}</span>
                </div>
              </div>
            </div>

            <div className="spacer-sm"></div>

            <section className="flex flex-col gap-2">
              <h2 className="text-base font-medium">Description</h2>
              <p className="text-sm">{problem?.description}</p>
            </section>

            {Array.isArray(problem?.features) &&
              problem.features.length > 0 && (
                <section className="flex flex-col gap-2">
                  <h2 className="text-base font-medium">Key features</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {problem.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </section>
              )}

            <div className="flex flex-col items-start justify-between gap-4 pt-2 md:flex-row md:items-center">
              <div className="text-sm muted flex items-center gap-4 flex-wrap">
                <span>Views: {problem?.views}</span>
                <span>Empathy: {problem?.empathy}</span>
                <span>Watching: {problem?.watching ?? 0}</span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto flex-col md:flex-row">
                <button
                  className="btn w-full md:w-auto"
                  onClick={() => {
                    if (user) {
                      toggleWatching(id, user.uid)
                        .then((res) => {
                          if (!res) return;
                          setWatched(res.watched);
                          setProblem((prev) => ({
                            ...prev,
                            watching: res.watching,
                            status: res.status ?? prev.status,
                          }));
                        })
                        .catch((err) => setError(getErrorMessage(err)));
                    } else {
                      navigate("/login");
                    }
                  }}
                >
                  {watched ? "Unwatch" : "Watch"}
                </button>
                <button
                  onClick={() => {
                    if (user) {
                      toggleEmpathy(id, user.uid)
                        .then((res) => {
                          if (!res) return;
                          setEmpathized(res.empathized);
                          setProblem((prev) => ({
                            ...prev,
                            empathy: res.empathy,
                          }));
                        })
                        .catch((error) => setError(getErrorMessage(error)));
                    } else {
                      navigate("/login");
                    }
                  }}
                  className={`btn w-full md:w-auto ${empathized ? "" : "btn-primary"}`}
                >
                  {empathized ? "Unempathize" : "Empathize"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <CommentSection
        problemId={id}
        setError={setError}
        ownerId={problem?.userId}
        onStatusChange={(status) =>
          setProblem((prev) => ({ ...prev, status: status ?? prev?.status }))
        }
      />
      <Footer />
    </>
  );
}

function CommentSection({ problemId, setError, ownerId, onStatusChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getComments = async () => {
      try {
        const comments = await getAllComments(problemId);
        setComments(comments);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    getComments();
  }, [problemId, loading]);

  // Build a threading model that supports arbitrary depth (id-only).
  const byId = new Map(comments.map((c) => [c.id, c]));
  const childrenMap = new Map(); // parentId -> [children]
  comments.forEach((c) => {
    const pid = c.parentId;
    if (!pid) return;
    if (!childrenMap.has(pid)) childrenMap.set(pid, []);
    childrenMap.get(pid).push(c);
  });
  const roots = comments.filter((c) => {
    const pid = c.parentId;
    if (!pid) return true;
    // If parent is not present among fetched comments, treat as root to avoid hiding
    return !byId.has(pid);
  });

  const renderThread = (node, depth = 0) => {
    const key = node.id || Date.now().toString();
    const children = childrenMap.get(key) || [];
    return (
      <div key={key} className={depth > 0 ? "pl-6 border-l" : ""}>
        <CommentCard
          type={depth === 0 ? "parent" : "child"}
          setComments={setComments}
          comment={node}
          problemId={problemId}
          setLoading={setLoading}
          setError={setError}
          ownerId={ownerId}
          onStatusChange={onStatusChange}
        />
        {children.map((child) => renderThread(child, depth + 1))}
      </div>
    );
  };

  return (
    <section className="container">
      {loading && (
        <div className="w-full flex items-center justify-center">
          <Loader />
        </div>
      )}
      {!loading && (
        <div className="card p-5 flex flex-col items-center gap-3">
          <div className="w-full flex items-center justify-start">
            <button
              className="btn btn-primary"
              onClick={() => {
                setComments((prev) => [
                  { status: "to-post", commentId: Date.now().toString() },
                  ...prev,
                ]);
              }}
            >
              Add Comment
            </button>
          </div>
          <div className="w-full flex flex-col gap-3">
            {roots.map((r) => renderThread(r, 0))}
          </div>
        </div>
      )}
    </section>
  );
}

function CommentCard({ setComments, comment, problemId, setLoading,setError, type, ownerId, onStatusChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [thisComment, setThisComment] = useState(comment);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment?.content || "");
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");


  const postComment = async () => {
    try {
      if (!user) {
        navigate("/login");
        return;
      }
      if (text.trim().length !== 0) {
        await addComment({
          content: text,
          userId: user.uid,
          userName: user.displayName,
          problemId: problemId,
          status: "posted"
        });
        setComments((prev) => prev.filter((x) => comment.commentId !== x.commentId));
        setLoading(true);
        return;
      }
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const linkify = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  if (comment.status === "to-post") {
    return (
      <div className="flex flex-col items-start gap-2 w-full">
        <textarea
          className="base-input-design w-full md:w-2/3"
          placeholder="Write your comment or Leave a solution link"
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <div className="flex items-center gap-2 w-full flex-col md:flex-row md:w-auto">
          <button className="btn btn-primary w-full md:w-auto" onClick={postComment}>
            Post
          </button>
          <button
            className="btn w-full md:w-auto"
            onClick={() => {
              setComments((prev) => prev.filter((x) => thisComment.commentId !== x.commentId));
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-full flex flex-col items-start gap-2 p-2">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex gap-1 items-center flex-wrap">
            <span className="tag text-xs md:text-sm">{thisComment?.userName}</span>
            <span className="text-xs md:text-sm muted">
              {thisComment?.createdAt ? timeCalc(thisComment.createdAt).text : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="cursor-pointer text-xs" onClick={()=>{
                if(disliked){
                  return;
                }
                toggleLike(thisComment.id, user.uid)
                  .then((res) => {
                    if (!res) return;
                    setLiked(res.liked);
                    setThisComment(prev=>({...prev,...res}))
                  })
                  .catch((error) => setError(getErrorMessage(error)));
              }}>{liked ? "▲" : "△"}</span>
              <span className="text-xs muted">{thisComment?.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="cursor-pointer text-xs" onClick={()=>{
                if(liked){
                  return;
                }
                toggleDislike(thisComment.id, user.uid)
                  .then((res) => {
                    if (!res) return;
                    setDisliked(res.disliked);
                    setThisComment(prev=>({...prev,...res}))
                  })
                  .catch((error) => setError(getErrorMessage(error)));
              }}>{disliked ? "▼" : "▽"}</span>
              <span className="text-xs muted">{thisComment?.dislikes}</span>
            </div>
            <span
              className="muted cursor-pointer text-xs"
              onClick={() => {
                if (!user) {
                  navigate("/login");
                  return;
                }
                if (thisComment?.userId !== user?.uid) {
                  return;
                }
                setEditing((prev) => !prev);
                setEditText(thisComment?.content || "");
              }}
            >
              Edit
            </span>
            <span
              className="muted cursor-pointer text-xs"
              onClick={() => {
                if (!user) {
                  navigate("/login");
                  return;
                }
                if (thisComment?.userId !== user?.uid) {
                  return;
                }
                const ok = window.confirm("Are you sure you want to delete this comment?");
                if (!ok) return;
                deleteComment(thisComment.id)
                  .then((res) => {
                    if (!res) return;
                    setComments((prev) => prev.filter((x) => x.id !== thisComment.id));
                    setLoading(true);
                  })
                  .catch((error) => setError(getErrorMessage(error)));
              }}
            >
              Delete
            </span>
            <span
              className="muted cursor-pointer text-xs"
              onClick={() => {
                if (!user) {
                  navigate("/login");
                  return;
                }
                setReplying((prev) => !prev);
                setReplyText("");
              }}
            >
              Reply
            </span>
            <span
              className={`cursor-pointer text-xs ${thisComment?.accepted ? 'text-green-600' : 'muted'}`}
              onClick={() => {
                if (!user) {
                  navigate('/login');
                  return;
                }
                // Only the problem author can accept
                if (ownerId && user?.uid !== ownerId) {
                  return;
                }
                toggleAccept(thisComment.id)
                  .then((res) => {
                    if (!res) return;
                    setThisComment((prev) => ({ ...prev, accepted: res.accepted }));
                    if (res.status && typeof onStatusChange === 'function') {
                      onStatusChange(res.status);
                    }
                  })
                  .catch((error) => setError(getErrorMessage(error)));
              }}
            >
              {thisComment?.accepted ? "Accepted" : "Accept"}
            </span>
          </div>
        </div>
        {editing ? (
          <div className="flex flex-col items-start gap-2 w-full">
            <textarea
              className="base-input-design w-full md:w-2/3"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            ></textarea>
            <div className="flex items-center gap-2 w-full flex-col md:flex-row md:w-auto">
              <button
                className="btn w-full md:w-auto"
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                    return;
                  }
                  if (thisComment?.userId !== user?.uid) {
                    return;
                  }
                  const toSave = editText.trim();
                  if (toSave.length === 0) return;
                  updateComment(thisComment.id, toSave)
                    .then((res) => {
                      if (!res) return;
                      setThisComment((prev) => ({ ...prev, content: toSave }));
                      setEditing(false);
                    })
                    .catch((error) => setError(getErrorMessage(error)));
                }}
              >
                Save
              </button>
              <button
                className="btn w-full md:w-auto"
                onClick={() => {
                  setEditing(false);
                  setEditText(thisComment?.content || "");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="leading-7 pl-1">{linkify(thisComment?.content || "")}</p>
        )}
        {replying && (
          <div className="flex flex-col items-start gap-2 w-full mt-2 pl-0 md:pl-6 border-l-0 md:border-l">
            <textarea
              className="base-input-design w-full md:w-2/3"
              placeholder={`Reply to @${thisComment?.userName}`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            ></textarea>
            <div className="flex items-center gap-2 w-full flex-col md:flex-row md:w-auto">
              <button
                className="btn btn-primary w-full md:w-auto"
                onClick={async () => {
                  try {
                    if (!user) {
                      navigate("/login");
                      return;
                    }
                    const toPost = replyText.trim();
                    if (toPost.length === 0) return;
                    await addComment({
                      content: toPost,
                      userId: user.uid,
                      userName: user.displayName,
                      problemId: problemId,
                      status: "posted",
                      parentId: thisComment.id,
                    });
                    setReplyText("");
                    setReplying(false);
                    setLoading(true);
                  } catch (error) {
                    setError(getErrorMessage(error));
                  }
                }}
              >
                Reply
              </button>
              <button
                className="btn w-full md:w-auto"
                onClick={() => {
                  setReplying(false);
                  setReplyText("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

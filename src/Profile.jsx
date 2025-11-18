import { useAuth } from "./context/AuthContext";
import { useState, useEffect } from "react";
import { getDocsByUserId } from "./firebase/problemHandler";
import { useNavigate, Link, useParams } from "react-router";
import { NavToHome, Footer } from "./App";
import ErrorAlert from "./ErrorAlert";
import { deleteAccountWithReauth } from "./firebase/auth";
import { getErrorMessage } from "./utils/errorMessages";
import { Helmet } from 'react-helmet-async';
import { getUnreadNotificationContents, markNotificationsAsRead } from "./firebase/notificationHandler";

export default function Profile() {
    const { user, logout, userProfile } = useAuth();
    const { notification } = useParams();
    const [myProblems, setMyProblems] = useState([]);
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [deleteAccount, setDeleteAccount] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (notification === "true") {
            getUnreadNotificationContents(user.uid)
                .then((contents) => {
                    setUnreadNotifications(contents);
                })
                .catch(err => setError(getErrorMessage(err)))
        }
    }, []);

    useEffect(() => {
        if (user) {
            getDocsByUserId(user.uid).then((problems) => {
                setMyProblems(problems);
            }).catch((err) => setError(getErrorMessage(err)));
        }
    }, [user]);

    if (!user) {
        return (
            <>
                <ErrorAlert isOpen={error.length > 0} message={error} />
                <header className="nav-bar">
                    <div className="container w-full flex items-center justify-between">
                        <NavToHome />
                        <Link to="/" className="btn">Back</Link>
                    </div>
                </header>
                <main className="container py-6 flex items-center justify-center">
                    <div className="card p-6 text-center max-w-sm">
                        <h2 className="text-lg font-semibold mb-4">Profile</h2>
                        <p className="muted mb-4">Please log in to view your profile</p>
                        <Link to="/login" className="btn btn-primary w-full">
                            Login
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Profile — Problem Board</title>
                <meta name="description" content="View and manage your problems and account on Problem Board." />
            </Helmet>
            <ErrorAlert isOpen={error.length > 0} message={error} />
            <header className="nav-bar">
                <div className="container w-full flex items-center justify-between">
                    <NavToHome />
                    <Link to="/" className="btn">Back</Link>
                </div>
            </header>
            <main className="container py-6">
                <div className="card p-4 flex flex-col gap-3">
                    <h2 className="text-lg font-semibold">My Profile</h2>
                    <div className="flex items-center gap-2">
                        <button className="btn" to="/login" onClick={logout}>
                            Logout
                        </button>
                    </div>
                    {user && (
                        <div className="border-t border-gray-300 pt-4">
                            <p className="text-sm muted mb-2">Email: {user.email}</p>
                            <p className="text-sm muted">Username: {user.displayName}</p>
                        </div>
                    )}
                    <h3 className="text-lg font-medium mt-4">Notifications ({unreadNotifications.length})</h3>
                    {unreadNotifications.length === 0 ?
                        (<p className="muted text-sm">There is no notifications yet.</p>) :
                        (
                            <div className="flex flex-col gap-3">
                                {unreadNotifications.map((notification, index) => (
                                    <Link to={`/problem/${notification.problemId}`} key={index} className="flex flex-col gap-1"
                                        onClick={
                                            () => { markNotificationsAsRead(notification.id).catch(err => console.error("Failed to mark as read:", err)) }
                                        }>
                                        <p>🔔 {notification.message}</p>
                                        <p className="muted text-sm">{notification.problemTitle}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    <h3 className="text-lg font-medium mt-4">My Problems ({myProblems.length})</h3>
                    {myProblems.length === 0 ? (
                        <p className="muted text-sm">You haven't posted any problems yet.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {myProblems.map((problem, index) => (
                                <div key={index} className="border-b pb-3 last:border-b-0">
                                    <Link to={`/problem/${problem.id}`} className="block">
                                        <h4 className="text-base font-medium hover:text-blue-600">
                                            {problem.title}
                                        </h4>
                                    </Link>
                                    <p className="muted text-sm mt-1">
                                        Views {problem.views} | Empathy {problem.empathy} | Watching {problem.watching}
                                    </p>
                                    <Link to={`/edit/${problem.id}`} className="text-xs text-blue-600 hover:underline">
                                        Edit ✎
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                    <h3 className="text-lg font-medium mt-4">My Accepted Solutions ({userProfile?.acceptedSolutions?.length || 0})</h3>
                    {(userProfile?.acceptedSolutions?.length || 0) === 0 && (
                        <p className="muted text-sm">You have not had any solutions accepted yet.</p>
                    )}
                    {userProfile?.acceptedSolutions?.length > 0 && (
                        <div className="flex flex-col gap-2 mb-6">
                            <p className="muted text-sm">Problems I solved</p>
                            {userProfile.acceptedSolutions.map((problemTitle, index) => (
                                <div key={index} className="border-l-2 border-green-500 pl-3 py-1">
                                    <p className="text-sm font-medium text-green-700">✓ Solution {index + 1}</p>
                                    <p className="text-sm text-gray-700">{problemTitle}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    className="btn btn-warn mt-6 w-full"
                    onClick={() => setDeleteAccount(true)}
                >
                    Delete Account
                </button>
            </main>
            <Footer />
            {deleteAccount && (
                <div className="fixed top-0 left-0 right-0 bottom-0 z-50 w-full h-full flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4 w-full max-w-sm">
                        <h2 className="text-lg font-semibold text-center text-red-600">Delete Account</h2>
                        <p className="text-sm text-center">To delete your account, please enter your password to confirm. This action cannot be undone and will delete all your problems and comments.</p>
                        <input
                            type="password"
                            className="base-input-design w-full"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                            <button
                                className="btn btn-warn w-full md:w-auto"
                                onClick={async () => {
                                    try {
                                        setDeletingAccount(true);
                                        await deleteAccountWithReauth(password);
                                        setDeleteAccount(false);
                                        navigate("/login");
                                    } catch (err) {
                                        setError(getErrorMessage(err));
                                    } finally {
                                        setDeletingAccount(false);
                                    }
                                }}
                            >
                                {deletingAccount ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                            <button
                                className="btn w-full md:w-auto"
                                onClick={() => setDeleteAccount(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

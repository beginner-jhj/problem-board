import { useState } from "react";
import { migrateCurrentUser, migrateUsersFromComments } from "../utils/migrateUsers";
import { useAuth } from "../context/AuthContext";

/**
 * Migration Tool Component
 * This component provides a UI to run the user migration script
 */
export default function MigrationTool() {
  const { user } = useAuth();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCurrentUserMigration = async () => {
    try {
      setLoading(true);
      setStatus("Creating profile for current user...");
      
      const result = await migrateCurrentUser(user);
      
      setResult(result);
      setStatus(result.message);
      setLoading(false);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const handleCommentsMigration = async () => {
    try {
      setLoading(true);
      setStatus("Migrating users from comment data...");
      
      const result = await migrateUsersFromComments();
      
      setResult(result);
      setStatus(result.message);
      setLoading(false);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="card p-5 flex flex-col gap-4 max-w-2xl">
      <h2 className="text-xl font-semibold">User Migration Tool</h2>
      
      <div className="flex flex-col gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
        <p className="text-sm font-medium">⚠️ Important Note:</p>
        <p className="text-sm muted">
          Firebase Auth doesn't allow querying other users' data without admin SDK. 
          This means we have two migration options:
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="border rounded p-4">
          <h3 className="font-medium mb-2">Option 1: Migrate Current User (Recommended)</h3>
          <p className="text-sm muted mb-3">
            Creates a Firestore profile for YOU (the currently logged-in user). 
            Each user needs to log in and run this for themselves.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleCurrentUserMigration}
            disabled={loading || !user}
          >
            {loading ? "Migrating..." : "Migrate My Profile"}
          </button>
          {!user && <p className="text-sm text-red-600 mt-2">Please log in first</p>}
        </div>

        <div className="border rounded p-4">
          <h3 className="font-medium mb-2">Option 2: Migrate from Comments</h3>
          <p className="text-sm muted mb-3">
            Extracts user data from existing comments (which already store userName). 
            Only works if there are comments in the database.
          </p>
          <button
            className="btn"
            onClick={handleCommentsMigration}
            disabled={loading}
          >
            {loading ? "Migrating..." : "Migrate from Comments"}
          </button>
        </div>
      </div>
      
      {status && (
        <div className="p-3 bg-gray-100 rounded">
          <p className="text-sm">{status}</p>
        </div>
      )}
      
      {result && result.migrated !== undefined && (
        <div className="p-3 bg-green-100 rounded">
          <p className="text-sm font-medium">Migration Results:</p>
          <ul className="text-sm mt-2 space-y-1">
            <li>✓ Migrated: {result.migrated} users</li>
            <li>⊘ Skipped: {result.skipped} users (already exist)</li>
            <li>✗ Errors: {result.errors} users</li>
          </ul>
        </div>
      )}

      {result && result.alreadyExists !== undefined && (
        <div className={`p-3 rounded ${result.alreadyExists ? 'bg-blue-100' : 'bg-green-100'}`}>
          <p className="text-sm">{result.message}</p>
        </div>
      )}
    </div>
  );
}

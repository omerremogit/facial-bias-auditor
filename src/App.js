import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload an image.");
      return;
    }

    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://bias-audit-api-2-production.up.railway.app/audit/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Server returned an error.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("❌ Network or parsing error:", err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Facial Bias Auditor</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-200"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Audit Image"}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-600 text-sm font-medium text-center">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="mt-6 border-t pt-4 text-center">
            <h2 className="text-lg font-semibold mb-2">📊 Audit Result</h2>

            <p className="mb-4 text-md text-gray-800">
              <span className="font-bold">👤 Closest Group:</span>{" "}
              <span className="text-blue-600">{result.closest_group}</span>
            </p>

            {result.distances &&
              Object.entries(result.distances).map(([group, score]) => (
                <p key={group} className="text-gray-700">
                  <span className="font-semibold">{group}:</span>{" "}
                  {score.toFixed(4)}
                </p>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

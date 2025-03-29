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
      const res = await fetch(
        "https://bias-audit-api-2-production.up.railway.app/audit/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Server returned an error.");
      }

      const data = await res.json();
      console.log("✅ Result from backend:", data);
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

        {result && typeof result === "object" && !error && (
          <div className="mt-6 border-t pt-4 text-center">
            <h2 className="text-lg font-semibold mb-2">📊 Audit Result</h2>
            {Object.entries(result).map(([group, value]) => {
              // Case 1: result is directly like { "White": 0.123 }
              if (typeof value === "number") {
                return (
                  <p key={group} className="text-gray-700">
                    <span className="font-semibold">{group}:</span>{" "}
                    {value.toFixed(4)}
                  </p>
                );
              }

              // Case 2: result is nested like { result: { "White": 0.123 } }
              if (typeof value === "object" && value !== null) {
                return Object.entries(value).map(([subgroup, score]) => (
                  <p key={subgroup} className="text-gray-700">
                    <span className="font-semibold">{subgroup}:</span>{" "}
                    {typeof score === "number" ? score.toFixed(4) : score}
                  </p>
                ));
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

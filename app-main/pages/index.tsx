import React, { useEffect, useState } from "react";

interface OuToEmailMap {
  targetOUs: string[];
  emails: string[];
}

const HomePage: React.FC = () => {
  const [ouToEmailMap, setOuToEmailMap] = useState<OuToEmailMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOuToEmailMap = async () => {
      try {
        const response = await fetch("/api/ouToEmailMap");

        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        setOuToEmailMap(data.ouToEmailMap);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };

    fetchOuToEmailMap();
  }, []);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white">
      <h1 className="text-5xl font-bold mb-4 animate-bounce">Welcome!</h1>

      {loading ? (
        <p>Loading email associations...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="mt-6">
          <h2 className="text-3xl font-semibold mb-4">Email Associations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ouToEmailMap.map((entry, index) => (
              <div
                key={index}
                className="p-4 bg-white text-black rounded-lg shadow-md"
              >
                <h3 className="font-bold mb-2">Target OUs:</h3>
                <ul className="list-disc list-inside mb-2">
                  {entry.targetOUs.map((ou, ouIndex) => (
                    <li key={ouIndex}>{ou}</li>
                  ))}
                </ul>
                <h3 className="font-bold mb-2">Emails:</h3>
                <ul className="list-disc list-inside">
                  {entry.emails.map((email, emailIndex) => (
                    <li key={emailIndex}>{email}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
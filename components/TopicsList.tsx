import { useEffect, useState } from 'react';

export function TopicsList() {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      const response = await fetch('/api/get-topics');
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    };

    fetchTopics();
    const interval = setInterval(fetchTopics, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Recent Topics</h2>
      <div className="space-y-4">
        {topics.map((topic: any) => (
          <div key={topic.signature} className="p-4 bg-white rounded-lg shadow">
            <p className="text-lg">{topic.topic}</p>
            <p className="text-sm text-gray-500">
              Submitted by: {topic.sender.slice(0, 4)}...{topic.sender.slice(-4)}
            </p>
            <a
              href={`https://explorer.solana.com/tx/${topic.signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm"
            >
              View Transaction
            </a>
          </div>
        ))}
      </div>
    </div>
  );
} 
import React, { useEffect, useState } from "react";
import api from "../api";

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/documents/");
      setDocs(res.data || []);
    } catch (err) {
      console.error("Failed to fetch docs", err);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api.delete(`/documents/${id}/`);
      fetchDocs();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Documents</h2>
      {loading && <p>Loading...</p>}
      {!loading && docs.length === 0 && <p>No documents uploaded.</p>}
      <ul>
        {docs.map((d) => (
          <li key={d.id} style={{ marginBottom: 10 }}>
            <strong>{d.title}</strong>
            {d.linked_chat_id && (
              <span style={{ marginLeft: 10 }}>Linked chat: {d.linked_chat_id}</span>
            )}
            <div>
              
              <button style={{ marginLeft: 10 }} onClick={() => handleDelete(d.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

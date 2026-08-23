import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function ConsumerView() {
  const { id } = useParams();

  const [batch, setBatch] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchBatchData();
  }, [id]);

  const fetchBatchData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Get batch details from Supabase
      const { data: batchData, error: batchError } = await supabase
        .from("Batches")
        .select("*")
        .eq("batch_id", id)
        .single();

      if (batchError) {
        console.error("Batch fetch error:", batchError);
        setErrorMessage("Batch details not found.");
        setLoading(false);
        return;
      }

      setBatch(batchData);

      // Get complete batch history from Supabase
      const { data: historyData, error: historyError } = await supabase
        .from("batch_history")
        .select("*")
        .eq("batch_id", id)
        .order("timestamp", { ascending: true });

      if (historyError) {
        console.error("History fetch error:", historyError);
        setHistory([]);
      } else {
        setHistory(historyData || []);
      }

      setLoading(false);
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrorMessage("Something went wrong while loading the batch.");
      setLoading(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>FarmTrace</h1>
          <p style={styles.subtitle}>
            Agricultural Product Traceability
          </p>

          <p style={styles.loading}>
            Loading batch information...
          </p>
        </div>
      </div>
    );
  }

  // Error screen
  if (!batch) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>FarmTrace</h1>

          <p style={styles.subtitle}>
            Agricultural Product Traceability
          </p>

          <div style={styles.errorBox}>
            <h2>Batch Not Found</h2>

            <p>{errorMessage}</p>

            <p>
              Batch ID:
              <strong> {id}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* HEADER */}
        <h1 style={styles.mainTitle}>
          FarmTrace
        </h1>

        <p style={styles.subtitle}>
          Agricultural Product Traceability
        </p>

        {/* BATCH HEADER */}
        <div style={styles.batchHeader}>
          <h2>Product Traceability</h2>

          <p>
            Batch ID:
            <strong> {batch.batch_id}</strong>
          </p>
        </div>

        {/* PRODUCT DETAILS */}
        <div style={styles.detailsCard}>

          <h2 style={styles.sectionTitle}>
            Product Information
          </h2>

          <div style={styles.row}>
            <strong>Product Name</strong>
            <span>{batch.product_name}</span>
          </div>

          <div style={styles.row}>
            <strong>Quantity</strong>
            <span>{batch.quantity} kg</span>
          </div>

          <div style={styles.row}>
            <strong>Harvest Date</strong>
            <span>{batch.harvest_date}</span>
          </div>

          <div style={styles.row}>
            <strong>Farm / Location</strong>
            <span>{batch.location}</span>
          </div>

          <div style={styles.row}>
            <strong>Farmer Name</strong>
            <span>{batch.farmer_name}</span>
          </div>

          <div style={styles.row}>
            <strong>Current Status</strong>

            <span style={styles.status}>
              {batch.status || "Created"}
            </span>
          </div>

        </div>

        {/* REAL SUPPLY CHAIN HISTORY */}
        <div style={styles.journey}>

          <h2>Supply Chain History</h2>

          <p style={styles.description}>
            Complete journey of this agricultural batch.
          </p>

          {history.length === 0 ? (
            <p>No history available.</p>
          ) : (
            history.map((item, index) => (
              <React.Fragment key={item.id}>

                <div style={styles.step}>

                  <div style={styles.icon}>
                    {index === 0
                      ? "🌱"
                      : item.status === "In Transit"
                      ? "🚚"
                      : item.status === "Delivered"
                      ? "✅"
                      : item.status === "At Distribution Center"
                      ? "🏪"
                      : item.status === "Collected"
                      ? "📦"
                      : item.status === "Quality Alert"
                      ? "⚠️"
                      : "📍"}
                  </div>

                  <div style={styles.stepContent}>

                    <strong style={styles.historyStatus}>
                      {item.status}
                    </strong>

                    <p>
                      📍 {item.location}
                    </p>

                    <small>
                      🕒 {new Date(item.timestamp).toLocaleString()}
                    </small>

                  </div>

                </div>

                {index < history.length - 1 && (
                  <div style={styles.line}></div>
                )}

              </React.Fragment>
            ))
          )}

        </div>

        {/* CURRENT STATUS */}
        <div style={styles.currentStatus}>

          <p>
            <strong>Current Status:</strong>
          </p>

          <h2>
            {batch.status || "Created"}
          </h2>

          <p>
            📍 {batch.location}
          </p>

        </div>

        {/* VERIFIED */}
        <div style={styles.verified}>
          ✓ Product information verified
        </div>

        <p style={styles.footer}>
          FarmTrace — Supply Chain Transparency
        </p>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    maxWidth: "750px",
    margin: "0 auto",
    background: "white",
    padding: "35px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },

  mainTitle: {
    textAlign: "center",
    marginBottom: "5px",
    fontSize: "36px",
  },

  subtitle: {
    color: "#666",
    textAlign: "center",
    marginBottom: "30px",
  },

  batchHeader: {
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "10px",
    textAlign: "center",
    marginBottom: "20px",
  },

  detailsCard: {
    padding: "20px",
    border: "1px solid #eee",
    borderRadius: "12px",
    marginBottom: "25px",
  },

  sectionTitle: {
    marginTop: "0",
    marginBottom: "10px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "16px 5px",
    borderBottom: "1px solid #eee",
  },

  status: {
    fontWeight: "bold",
    color: "#1f7a4d",
  },

  journey: {
    marginTop: "20px",
    padding: "25px",
    background: "#f8fafc",
    borderRadius: "12px",
  },

  description: {
    color: "#666",
    marginBottom: "25px",
  },

  step: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
  },

  icon: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    background: "white",
    borderRadius: "50%",
    flexShrink: 0,
  },

  stepContent: {
    paddingTop: "5px",
  },

  historyStatus: {
    fontSize: "18px",
  },

  line: {
    height: "30px",
    borderLeft: "2px solid #2563eb",
    marginLeft: "19px",
  },

  currentStatus: {
    marginTop: "25px",
    padding: "20px",
    background: "#eef6f1",
    borderRadius: "10px",
    textAlign: "center",
  },

  verified: {
    marginTop: "25px",
    padding: "15px",
    textAlign: "center",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
    fontWeight: "bold",
  },

  loading: {
    textAlign: "center",
    padding: "30px",
    color: "#666",
  },

  errorBox: {
    marginTop: "25px",
    padding: "25px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "10px",
    textAlign: "center",
  },

  footer: {
    textAlign: "center",
    marginTop: "25px",
    color: "#888",
    fontSize: "14px",
  },
};

export default ConsumerView;
import React, { useEffect, useState } from "react";
import {
  Plus,
  Truck,
  Package,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Dashboard() {
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load batches from Supabase
  const loadBatches = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("Batches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading batches:", error);
      alert("Error loading batches: " + error.message);
      setLoading(false);
      return;
    }

    setBatches(data || []);
    setLoading(false);
  };

  // Load batches when dashboard opens
  useEffect(() => {
    loadBatches();
  }, []);

  // Statistics
  const totalBatches = batches.length;

  const inTransit = batches.filter(
    (batch) => batch.status === "In Transit"
  ).length;

  const delivered = batches.filter(
    (batch) => batch.status === "Delivered"
  ).length;

  const qualityAlerts = batches.filter(
    (batch) => batch.status === "Quality Alert"
  ).length;

  // Open Batch Details
  const handleUpdate = (batchId) => {
    navigate(`/batch/${encodeURIComponent(batchId)}`);
  };

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <header style={styles.header}>

        <div>
          <h1 style={styles.title}>
            FarmTrace
          </h1>

          <p style={styles.subtitle}>
            Agricultural Supply Chain Transparency
          </p>
        </div>

        <button
          style={styles.createButton}
          onClick={() => navigate("/create-batch")}
        >
          <Plus size={20} />
          Create New Batch
        </button>

      </header>


      {/* STATISTICS */}
      <div style={styles.cards}>

        <StatCard
          title="Total Batches"
          value={totalBatches}
          icon={<Package size={30} />}
        />

        <StatCard
          title="In Transit"
          value={inTransit}
          icon={<Truck size={30} />}
        />

        <StatCard
          title="Delivered"
          value={delivered}
          icon={<CheckCircle size={30} />}
        />

        <StatCard
          title="Quality Alerts"
          value={qualityAlerts}
          icon={<AlertTriangle size={30} />}
        />

      </div>


      {/* RECENT BATCHES */}
      <section style={styles.section}>

        <h2 style={styles.sectionTitle}>
          Recent Produce Batches
        </h2>

        {loading ? (

          <div style={styles.emptyMessage}>
            Loading batches...
          </div>

        ) : batches.length === 0 ? (

          <div style={styles.emptyMessage}>
            No batches created yet.
          </div>

        ) : (

          <div style={styles.table}>

            {/* TABLE HEADER */}
            <div style={styles.tableHeader}>

              <span>Batch ID</span>

              <span>Product</span>

              <span>Quantity</span>

              <span>Location</span>

              <span>Status</span>

              <span>Action</span>

            </div>


            {/* TABLE ROWS */}
            {batches.map((batch) => (

              <div
                style={styles.row}
                key={batch.id}
              >

                <strong>
                  {batch.batch_id}
                </strong>

                <span>
                  {batch.product_name}
                </span>

                <span>
                  {batch.quantity} kg
                </span>

                <span>
                  {batch.location}
                </span>

                <span style={getStatusStyle(batch.status)}>
                  {batch.status || "Created"}
                </span>

                <button
                  onClick={() =>
                    handleUpdate(batch.batch_id)
                  }
                  style={styles.updateButton}
                >
                  Update
                </button>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}


/* STATISTICS CARD */

function StatCard({ title, value, icon }) {

  return (
    <div style={styles.card}>

      <div>

        <p style={styles.cardTitle}>
          {title}
        </p>

        <h2 style={styles.cardValue}>
          {value}
        </h2>

      </div>

      <div style={styles.icon}>
        {icon}
      </div>

    </div>
  );
}


/* STATUS STYLE */

function getStatusStyle(status) {

  if (status === "Delivered") {
    return {
      fontWeight: "bold",
      color: "#1f7a4d",
    };
  }

  if (status === "Quality Alert") {
    return {
      fontWeight: "bold",
      color: "#dc2626",
    };
  }

  if (status === "In Transit") {
    return {
      fontWeight: "bold",
      color: "#2563eb",
    };
  }

  return {
    fontWeight: "bold",
    color: "#555",
  };
}


/* STYLES */

const styles = {

  container: {
    minHeight: "100vh",
    padding: "40px",
    background: "#f5f7f6",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px",
  },

  title: {
    margin: 0,
    fontSize: "36px",
  },

  subtitle: {
    color: "#666",
    marginTop: "8px",
    fontSize: "20px",
  },

  createButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 22px",
    border: "none",
    borderRadius: "8px",
    background: "#1f7a4d",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "40px",
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  cardTitle: {
    color: "#777",
    margin: 0,
    fontSize: "18px",
  },

  cardValue: {
    fontSize: "32px",
    margin: "8px 0 0",
  },

  icon: {
    color: "#1f7a4d",
  },

  section: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },

  sectionTitle: {
    textAlign: "center",
    marginTop: 0,
    marginBottom: "25px",
    fontSize: "28px",
  },

  table: {
    width: "100%",
    overflowX: "auto",
  },

  tableHeader: {
    display: "grid",
    gridTemplateColumns:
      "1.1fr 1.2fr 1fr 1.2fr 1.2fr 1fr",
    padding: "18px 15px",
    background: "#f0f2f1",
    fontWeight: "bold",
    color: "#555",
    fontSize: "17px",
  },

  row: {
    display: "grid",
    gridTemplateColumns:
      "1.1fr 1.2fr 1fr 1.2fr 1.2fr 1fr",
    padding: "20px 15px",
    borderBottom: "1px solid #eee",
    alignItems: "center",
    fontSize: "17px",
  },

  updateButton: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontSize: "15px",
  },

  emptyMessage: {
    padding: "40px",
    textAlign: "center",
    color: "#777",
    fontSize: "18px",
  },

};

export default Dashboard;
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../supabaseClient";

function BatchDetails() {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [batch, setBatch] = useState(null);
  const [history, setHistory] = useState([]);

  const [newStatus, setNewStatus] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // =====================================================
  // LOAD BATCH FROM SUPABASE
  // =====================================================

  const loadBatch = async () => {
    setLoading(true);

    console.log("Loading batch:", batchId);

    // Get batch
    const { data: batchData, error: batchError } = await supabase
      .from("Batches")
      .select("*")
      .eq("batch_id", batchId)
      .single();

    if (batchError) {
      console.error("Batch loading error:", batchError);
      setBatch(null);
      setLoading(false);
      return;
    }

    console.log("Batch received:", batchData);

    setBatch(batchData);

    setNewStatus(batchData.status || "Created");
    setNewLocation(batchData.location || "");

    // Get history
    const { data: historyData, error: historyError } = await supabase
      .from("batch_history")
      .select("*")
      .eq("batch_id", batchId)
      .order("id", { ascending: true });

    if (historyError) {
      console.error("History loading error:", historyError);
      setHistory([]);
    } else {
      console.log("History received:", historyData);
      setHistory(historyData || []);
    }

    setLoading(false);
  };

  // Load batch when page opens
  useEffect(() => {
    loadBatch();
  }, [batchId]);

  // =====================================================
  // UPDATE BATCH
  // =====================================================

  const handleUpdate = async () => {
    if (!newStatus || !newLocation.trim()) {
      alert("Please select a status and enter a location.");
      return;
    }

    setUpdating(true);

    const location = newLocation.trim();

    try {
      // -------------------------------------------------
      // STEP 1: UPDATE CURRENT BATCH
      // -------------------------------------------------

      const { data: updatedBatch, error: batchError } =
        await supabase
          .from("Batches")
          .update({
            status: newStatus,
            location: location,
          })
          .eq("batch_id", batchId)
          .select()
          .single();

      if (batchError) {
        console.error("Batch update error:", batchError);

        alert(
          "Could not update batch: " +
            batchError.message
        );

        setUpdating(false);
        return;
      }

      console.log("Updated batch:", updatedBatch);

      // -------------------------------------------------
      // STEP 2: ADD UPDATE TO HISTORY
      // -------------------------------------------------

      const { data: historyEntry, error: historyError } =
        await supabase
          .from("batch_history")
          .insert([
            {
              batch_id: batchId,
              status: newStatus,
              location: location,
              timestamp: new Date().toISOString(),
            },
          ])
          .select()
          .single();

      if (historyError) {
        console.error(
          "History update error:",
          historyError
        );

        alert(
          "Batch was updated, but history could not be saved: " +
            historyError.message
        );

        setBatch(updatedBatch);
        setUpdating(false);
        return;
      }

      console.log(
        "History entry added:",
        historyEntry
      );

      // -------------------------------------------------
      // STEP 3: UPDATE SCREEN
      // -------------------------------------------------

      setBatch(updatedBatch);

      setHistory((previousHistory) => [
        ...previousHistory,
        historyEntry,
      ]);

      alert("Batch updated successfully!");

    } catch (error) {
      console.error("Unexpected error:", error);

      alert(
        "Something went wrong while updating the batch."
      );
    }

    setUpdating(false);
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.notFoundCard}>
          <h2>Loading Batch...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // BATCH NOT FOUND
  // =====================================================

  if (!batch) {
    return (
      <div style={styles.container}>
        <div style={styles.notFoundCard}>

          <h1>Batch Details</h1>

          <p style={styles.errorText}>
            No batch details found.
          </p>

          <p>
            Batch ID:
            <strong> {batchId}</strong>
          </p>

          <button
            style={styles.backButton}
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>

        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div style={styles.container}>

      {/* TITLE */}

      <h1 style={styles.title}>
        Batch Details
      </h1>

      <p style={styles.subtitle}>
        Agricultural product traceability
      </p>


      {/* BATCH ID */}

      <div style={styles.batchIdBox}>

        <h2>
          {batch.batch_id}
        </h2>

      </div>


      {/* PRODUCT INFORMATION */}

      <div style={styles.card}>

        <h2 style={styles.sectionTitle}>
          Product Information
        </h2>


        <div style={styles.row}>
          <strong>Product Name</strong>

          <span>
            {batch.product_name}
          </span>
        </div>


        <div style={styles.row}>
          <strong>Quantity</strong>

          <span>
            {batch.quantity} kg
          </span>
        </div>


        <div style={styles.row}>
          <strong>Harvest Date</strong>

          <span>
            {batch.harvest_date}
          </span>
        </div>


        <div style={styles.row}>
          <strong>Farm / Location</strong>

          <span>
            {batch.location}
          </span>
        </div>


        <div style={styles.row}>
          <strong>Farmer Name</strong>

          <span>
            {batch.farmer_name}
          </span>
        </div>


        <div style={styles.row}>
          <strong>Current Status</strong>

          <span style={styles.status}>
            {batch.status || "Created"}
          </span>
        </div>

      </div>


      {/* UPDATE SECTION */}

      <div style={styles.updateCard}>

        <h2>
          Update Batch
        </h2>

        <p style={styles.description}>
          Update the current stage and location
          of the agricultural product.
        </p>


        {/* STATUS */}

        <label style={styles.label}>
          New Status
        </label>

        <select
          value={newStatus}
          onChange={(e) =>
            setNewStatus(e.target.value)
          }
          style={styles.input}
        >

          <option value="Created">
            Created
          </option>

          <option value="Collected">
            Collected
          </option>

          <option value="In Transit">
            In Transit
          </option>

          <option value="At Distribution Center">
            At Distribution Center
          </option>

          <option value="Delivered">
            Delivered
          </option>

          <option value="Quality Alert">
            Quality Alert
          </option>

        </select>


        {/* LOCATION */}

        <label style={styles.label}>
          Current Location
        </label>

        <input
          type="text"
          value={newLocation}
          onChange={(e) =>
            setNewLocation(e.target.value)
          }
          placeholder="Enter current location"
          style={styles.input}
        />


        {/* SAVE BUTTON */}

        <button
          onClick={handleUpdate}
          style={{
            ...styles.saveButton,
            opacity: updating ? 0.6 : 1,
          }}
          disabled={updating}
        >

          {updating
            ? "Saving..."
            : "Save Update"}

        </button>

      </div>


      {/* HISTORY */}

      <div style={styles.historyCard}>

        <h2>
          Batch History
        </h2>

        <p style={styles.description}>
          Complete journey of this agricultural
          batch.
        </p>


        {history.length === 0 ? (

          <p>
            No history available.
          </p>

        ) : (

          history.map((item) => (

            <div
              style={styles.historyItem}
              key={item.id}
            >

              <div style={styles.historyCircle}>
                ✓
              </div>


              <div style={styles.historyContent}>

                <strong style={styles.historyStatus}>
                  {item.status}
                </strong>


                <p style={styles.historyLocation}>
                  📍 Location: {item.location}
                </p>


                <small>
                  🕒{" "}
                  {new Date(
                    item.timestamp
                  ).toLocaleString()}
                </small>

              </div>

            </div>

          ))

        )}

      </div>


      {/* QR CODE */}

      <div style={styles.qrSection}>

        <h2>
          Batch QR Code
        </h2>

        <p>
          Scan this QR code to view the
          product traceability information.
        </p>

        <QRCodeCanvas
          value={`${window.location.origin}/consumer/${batch.batch_id}`}
          size={200}
        />

        <p style={styles.qrId}>
          Batch ID: {batch.batch_id}
        </p>

      </div>


      {/* BACK BUTTON */}

      <button
        style={styles.backButton}
        onClick={() => navigate("/dashboard")}
      >
        Back to Dashboard
      </button>

    </div>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = {

  container: {
    minHeight: "100vh",
    padding: "40px",
    background: "#f5f7f6",
    fontFamily: "Arial, sans-serif",
  },

  title: {
    textAlign: "center",
    fontSize: "42px",
    marginBottom: "8px",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    fontSize: "20px",
    marginBottom: "30px",
  },

  batchIdBox: {
    maxWidth: "800px",
    margin: "0 auto 20px",
    padding: "25px",
    background: "#f8fafc",
    borderRadius: "12px",
    textAlign: "center",
  },

  card: {
    maxWidth: "800px",
    margin: "0 auto 25px",
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  sectionTitle: {
    marginTop: "0",
    marginBottom: "10px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 5px",
    borderBottom: "1px solid #eee",
    fontSize: "18px",
  },

  status: {
    fontWeight: "bold",
    color: "#2563eb",
  },

  updateCard: {
    maxWidth: "800px",
    margin: "0 auto 25px",
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  description: {
    color: "#666",
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginTop: "20px",
    marginBottom: "7px",
    fontWeight: "bold",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box",
  },

  saveButton: {
    width: "100%",
    marginTop: "25px",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#1f7a4d",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },

  historyCard: {
    maxWidth: "800px",
    margin: "0 auto 25px",
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  historyItem: {
    display: "flex",
    gap: "15px",
    padding: "18px 0",
    borderBottom: "1px solid #eee",
  },

  historyCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#1f7a4d",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  historyContent: {
    flex: 1,
  },

  historyStatus: {
    fontSize: "18px",
  },

  historyLocation: {
    marginBottom: "5px",
  },

  qrSection: {
    maxWidth: "800px",
    margin: "0 auto 25px",
    padding: "30px",
    background: "#f8fafc",
    borderRadius: "12px",
    textAlign: "center",
  },

  qrId: {
    fontWeight: "bold",
    marginTop: "15px",
  },

  backButton: {
    display: "block",
    width: "800px",
    maxWidth: "100%",
    margin: "0 auto",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },

  notFoundCard: {
    maxWidth: "700px",
    margin: "50px auto",
    background: "white",
    padding: "40px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  errorText: {
    color: "red",
    fontSize: "18px",
  },
};

export default BatchDetails;
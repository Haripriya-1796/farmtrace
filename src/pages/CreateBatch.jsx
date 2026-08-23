import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function CreateBatch() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    batchId: "",
    productName: "",
    quantity: "",
    harvestDate: "",
    location: "",
    farmerName: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check all fields
    if (
      !formData.batchId ||
      !formData.productName ||
      !formData.quantity ||
      !formData.harvestDate ||
      !formData.location ||
      !formData.farmerName
    ) {
      alert("Please fill all the fields.");
      return;
    }

    try {
      // STEP 1: Create batch in Batches table
      const { data: batchData, error: batchError } = await supabase
        .from("Batches")
        .insert([
          {
            batch_id: formData.batchId,
            product_name: formData.productName,
            quantity: formData.quantity,
            harvest_date: formData.harvestDate,
            location: formData.location,
            farmer_name: formData.farmerName,
            status: "Created",
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (batchError) {
        console.error("Batch creation error:", batchError);
        alert("Error creating batch: " + batchError.message);
        return;
      }

      // STEP 2: Add first entry to batch_history
      const { error: historyError } = await supabase
        .from("batch_history")
        .insert([
          {
            batch_id: formData.batchId,
            status: "Created",
            location: formData.location,
            timestamp: new Date().toISOString(),
          },
        ]);

      if (historyError) {
        console.error("History creation error:", historyError);
        alert(
          "Batch was created, but history could not be saved: " +
            historyError.message
        );
        return;
      }

      // Success
      alert("Batch created successfully!");

      // Go to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "white",
          padding: "35px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginBottom: "8px" }}>
          Create New Batch
        </h1>

        <p style={{ color: "#666", marginBottom: "30px" }}>
          Enter the details of the agricultural product batch.
        </p>

        <form onSubmit={handleSubmit}>

          {/* Batch ID */}
          <div style={{ marginBottom: "20px" }}>
            <label>Batch ID</label>

            <input
              type="text"
              name="batchId"
              placeholder="Example: FT-001"
              value={formData.batchId}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Product Name */}
          <div style={{ marginBottom: "20px" }}>
            <label>Product Name</label>

            <input
              type="text"
              name="productName"
              placeholder="Example: Tomato"
              value={formData.productName}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: "20px" }}>
            <label>Quantity</label>

            <input
              type="number"
              name="quantity"
              placeholder="Example: 500"
              value={formData.quantity}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Harvest Date */}
          <div style={{ marginBottom: "20px" }}>
            <label>Harvest Date</label>

            <input
              type="date"
              name="harvestDate"
              value={formData.harvestDate}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: "20px" }}>
            <label>Farm / Location</label>

            <input
              type="text"
              name="location"
              placeholder="Example: Thanjavur"
              value={formData.location}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Farmer Name */}
          <div style={{ marginBottom: "30px" }}>
            <label>Farmer Name</label>

            <input
              type="text"
              name="farmerName"
              placeholder="Enter farmer name"
              value={formData.farmerName}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "15px",
            }}
          >
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "14px",
                border: "none",
                borderRadius: "8px",
                background: "#2563eb",
                color: "white",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Create Batch
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={{
                flex: 1,
                padding: "14px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                background: "white",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "7px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
  boxSizing: "border-box",
};

export default CreateBatch;
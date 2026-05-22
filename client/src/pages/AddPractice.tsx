import axios from "axios";
import { useState } from "react";

function AddPractice() {
  const [practiceType, setPracticeType] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    await axios.post("http://localhost:5001/practice", {
        practiceType,
        duration,
        intensity,
    });

    console.log("Practice session saved");
  }

  return (
    <div className="app">
      <h1 className="title">Add Practice Session</h1>

      <form className="practice-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Practice Type"
          value={practiceType}
          onChange={(event) => setPracticeType(event.target.value)}
        />

        <input
          type="text"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
        />

        <select
          value={intensity}
          onChange={(event) => setIntensity(event.target.value)}
        >
          <option value="">Select Intensity</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button type="submit">Save Practice</button>
      </form>
    </div>
  );
}

export default AddPractice;
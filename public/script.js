/* ---------- SUBJECT FUNCTIONS ---------- */

// Add Subject
function addSubject() {
  const name = document.getElementById("sname").value.trim();

  if (!name) {
    alert("❌ Please enter a subject");
    return;
  }

  fetch("/subject", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  })
  .then(r => r.json())
  .then(() => {
    alert("✅ Subject added successfully");
    document.getElementById("sname").value = ""; // clear input
    loadSubjects(); // refresh subject list
  })
  .catch(() => alert("❌ Could not add subject"));
}

// Load Subjects List
// Load Subjects List as cards (like trainers)
function loadSubjects() {
  fetch("/subject")
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById("subjectList");
      list.innerHTML = "";

      if (data.length === 0) {
        list.innerHTML = "<p>No subjects available</p>";
      } else {
        data.forEach(sub => {
          const div = document.createElement("div");
          div.className = "subject-card";
          div.innerHTML = `
            <span>${sub.name}</span>
            <span class="delete-btn" onclick="deleteSubject(${sub.id})">❌</span>
          `;
          list.appendChild(div);
        });
      }
    });
}

// Delete Subject
function deleteSubject(id) {
  if (!confirm("Are you sure you want to delete this subject?")) return;

  fetch(`/subject/${id}`, { method: "DELETE" })
    .then(() => loadSubjects());
}

/* ---------- TRAINER FUNCTIONS ---------- */

// Add Trainer
function addTrainer() {
  const name = document.getElementById("tname").value.trim();
  const subject = document.getElementById("tsubject").value.trim();
  const availability = document.getElementById("availability").value;

  if (!name || !subject) {
    alert("❌ Please enter trainer name and subject");
    return;
  }

  fetch("/trainer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, subject, availability })
  })
  .then(r => {
    if (!r.ok) throw new Error("Insert failed");
    return r.json();
  })
  .then(() => {
    alert("✅ Trainer added successfully");
    document.getElementById("tname").value = "";
    document.getElementById("tsubject").value = "";
    loadTrainers();
  })
  .catch(() => alert("❌ Trainer NOT added"));
}

// Load All Trainers
function loadTrainers() {
  fetch("/trainer")
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById("trainerList");
      list.innerHTML = "";

      if (data.length === 0) {
        list.innerHTML = "<li>No trainers available</li>";
      } else {
        data.forEach(t => {
          list.innerHTML += `
            <li style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
              <span>${t.empId} - ${t.name} (${t.subject}) [${t.availability}]</span>
              <span class="delete-subject" onclick="deleteTrainer(${t.empId})">❌</span>
            </li>`;
        });
      }
    });
}

// Delete Trainer
function deleteTrainer(id) {
  if (!confirm("Are you sure you want to delete this trainer?")) return;

  fetch(`/trainer/${id}`, { method: "DELETE" })
    .then(() => loadTrainers());
}

/* ---------- SEARCH FUNCTIONS ---------- */

// Search by ID
function findById() {
  const id = document.getElementById("findId").value.trim();
  if (!id) return alert("Please enter a Trainer ID");

  fetch(`/trainer/${id}`)
    .then(r => r.ok ? r.json() : null)
    .then(d => {
      const list = document.getElementById("idResult");
      list.innerHTML = "";

      if (d) {
        list.innerHTML = `<li>${d.name} teaches ${d.subject} [${d.availability}]</li>`;
      } else {
        list.innerHTML = `<li>No trainer available with ID ${id}</li>`;
      }
    })
    .catch(() => {
      document.getElementById("idResult").innerHTML = `<li>No trainer available with ID ${id}</li>`;
    });
}

// Search by Subject
function findBySubject() {
  const subject = document.getElementById("findSubject").value.trim();
  if (!subject) return alert("Enter subject");

  fetch(`/trainer/${subject}/topic`)
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById("subjectResult");
      list.innerHTML = "";

      if (data.length === 0) list.innerHTML = "<li>No trainers available</li>";
      else data.forEach(t => {
        list.innerHTML += `<li>${t.name}</li>`;
      });
    });
}

/* ---------- DASHBOARD ---------- */
function loadDashboard() {
  fetch("/dashboard/subject-count")
    .then(r => r.json())
    .then(data => {
      const dash = document.getElementById("dashboardList");
      dash.innerHTML = "";

      if (data.length === 0) dash.innerHTML = "<li>No data available</li>";
      else data.forEach(d => {
        dash.innerHTML += `<li>${d.subject} → ${d.count} trainers</li>`;
      });
    });
}

/* ---------- INITIAL LOAD ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadSubjects();
  loadTrainers();
});

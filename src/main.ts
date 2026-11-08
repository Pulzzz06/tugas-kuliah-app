import "./style.css";
import {
  type TugasKuliah,
  type TaskStatus,
  type PriorityLevel,
  StorageWrapper,
} from "./types";

// Membaca Environment Variables dari .env
const appName: string =
  import.meta.env.VITE_APP_NAME || "Manajemen Tugas Kuliah";
const appVersion: string = import.meta.env.VITE_APP_VERSION || "1.0.0";

// Inisialisasi Generic Storage untuk Array TugasKuliah
const storage = new StorageWrapper<TugasKuliah>("daftar_tugas_kuliah");
let daftarTugas: TugasKuliah[] = storage.getItems();
let editId: number | null = null;

// Set judul & versi dari .env ke DOM
document.getElementById("app-title")!.textContent = appName;
document.getElementById("app-version")!.textContent = `v${appVersion}`;

const form = document.getElementById("task-form") as HTMLFormElement;
const inputJudul = document.getElementById("judul") as HTMLInputElement;
const inputMatkul = document.getElementById("mataKuliah") as HTMLInputElement;
const inputDeadline = document.getElementById("deadline") as HTMLInputElement;
const inputPrioritas = document.getElementById(
  "prioritas",
) as HTMLSelectElement;
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const cancelEditBtn = document.getElementById(
  "cancel-btn",
) as HTMLButtonElement;
const taskListContainer = document.getElementById(
  "task-list",
) as HTMLDivElement;

function renderTasks(): void {
  taskListContainer.innerHTML = "";

  if (daftarTugas.length === 0) {
    taskListContainer.innerHTML = `<p style="color: #64748b; text-align: center; padding: 1rem;">Belum ada tugas kuliah yang tercatat.</p>`;
    return;
  }

  daftarTugas.forEach((tugas: TugasKuliah) => {
    const item = document.createElement("div");
    item.className = `task-item ${tugas.isCompleted ? "task-done" : ""}`;

    const statusClass = tugas.isCompleted ? "status-done" : "status-pending";

    item.innerHTML = `
      <div class="task-info">
        <h3>${tugas.judul}</h3>
        <div class="task-meta">
          <strong>${tugas.mataKuliah}</strong> | Tenggat: ${tugas.deadline} | Prioritas: ${tugas.prioritas}
        </div>
        <span class="status-pill ${statusClass}">${tugas.status}</span>
      </div>
      <div class="task-actions">
        <button class="btn-outline" data-action="toggle" data-id="${tugas.id}">
          ${tugas.isCompleted ? "Batal Selesai" : "Tandai Selesai"}
        </button>
        <button class="btn-outline" data-action="edit" data-id="${tugas.id}">Edit</button>
        <button class="btn-danger" data-action="delete" data-id="${tugas.id}">Hapus</button>
      </div>
    `;

    taskListContainer.appendChild(item);
  });
}

// Tambah atau Simpan Edit Tugas
form.addEventListener("submit", (e: Event) => {
  e.preventDefault();

  const judul: string = inputJudul.value.trim();
  const mataKuliah: string = inputMatkul.value.trim();
  const deadline: string = inputDeadline.value;
  const prioritas = inputPrioritas.value as PriorityLevel;

  if (editId !== null) {
    // Mode Edit
    daftarTugas = daftarTugas.map((t) =>
      t.id === editId ? { ...t, judul, mataKuliah, deadline, prioritas } : t,
    );
    editId = null;
    submitBtn.textContent = "Tambah Tugas";
    cancelEditBtn.style.display = "none";
  } else {
    // Mode Tambah Baru
    const tugasBaru: TugasKuliah = {
      id: Date.now(),
      judul,
      mataKuliah,
      deadline,
      prioritas,
      status: "Belum Selesai",
      isCompleted: false,
    };
    daftarTugas.push(tugasBaru);
  }

  storage.saveItems(daftarTugas);
  form.reset();
  renderTasks();
});

// Batal Edit
cancelEditBtn.addEventListener("click", () => {
  editId = null;
  form.reset();
  submitBtn.textContent = "Tambah Tugas";
  cancelEditBtn.style.display = "none";
});

// Event Delegation untuk tombol Selesai, Edit, dan Hapus
taskListContainer.addEventListener("click", (e: Event) => {
  const target = e.target as HTMLElement;
  const action = target.getAttribute("data-action");
  const idStr = target.getAttribute("data-id");
  if (!action || !idStr) return;

  const id: number = Number(idStr);

  if (action === "toggle") {
    daftarTugas = daftarTugas.map((t) => {
      if (t.id === id) {
        const nextCompleted: boolean = !t.isCompleted;
        const nextStatus: TaskStatus = nextCompleted
          ? "Selesai"
          : "Belum Selesai";
        return { ...t, isCompleted: nextCompleted, status: nextStatus };
      }
      return t;
    });
  } else if (action === "delete") {
    daftarTugas = daftarTugas.filter((t) => t.id !== id);
  } else if (action === "edit") {
    const tugas = daftarTugas.find((t) => t.id === id);
    if (tugas) {
      inputJudul.value = tugas.judul;
      inputMatkul.value = tugas.mataKuliah;
      inputDeadline.value = tugas.deadline;
      inputPrioritas.value = tugas.prioritas;
      editId = tugas.id;
      submitBtn.textContent = "Simpan Perubahan";
      cancelEditBtn.style.display = "inline-block";
    }
  }

  storage.saveItems(daftarTugas);
  renderTasks();
});

renderTasks();

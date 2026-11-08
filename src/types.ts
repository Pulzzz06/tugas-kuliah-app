// 1. Type Alias & Union Type
export type TaskStatus = "Belum Selesai" | "Selesai";
export type PriorityLevel = "Rendah" | "Sedang" | "Tinggi";

// 2. Interface & Primitive Types (number, string, boolean)
export interface TugasKuliah {
  id: number;
  judul: string;
  mataKuliah: string;
  deadline: string;
  status: TaskStatus;
  prioritas: PriorityLevel;
  isCompleted: boolean;
}

// 3. Generics Sederhana untuk membungkus penyimpanan LocalStorage
export class StorageWrapper<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  // Mengambil data bertipe Array dari T (T[])
  getItems(): T[] {
    const rawData = localStorage.getItem(this.key);
    return rawData ? JSON.parse(rawData) : [];
  }

  // Menyimpan data bertipe Array dari T (T[])
  saveItems(items: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}

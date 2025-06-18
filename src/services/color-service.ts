
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, Timestamp, where, limit } from 'firebase/firestore';

export interface UserSavedColor {
  id: string; // Firestore document ID
  hex: string;
  name?: string; // Optional name for the color
  createdAt: Timestamp;
}

export interface SaveColorData {
    hex: string;
    name?: string;
}

// Helper to check for existing color by hex for a user
async function checkExistingColorByHex(userId: string, hex: string): Promise<boolean> {
  const q = query(
    collection(db, `users/${userId}/savedColors`),
    where("hex", "==", hex.toUpperCase()), // Store and check hex in a consistent case
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function saveUserColor(userId: string, colorData: SaveColorData): Promise<{success: boolean; message: string; colorId?: string}> {
  if (!userId) {
    return { success: false, message: "User not authenticated." };
  }
  if (!colorData.hex || !/^#[0-9A-F]{6}$/i.test(colorData.hex)) {
    return { success: false, message: "Invalid color HEX code." };
  }

  const upperCaseHex = colorData.hex.toUpperCase();

  try {
    const alreadyExists = await checkExistingColorByHex(userId, upperCaseHex);
    if (alreadyExists) {
        return { success: false, message: `Color ${upperCaseHex} is already saved.` };
    }

    const docRef = await addDoc(collection(db, `users/${userId}/savedColors`), {
      ...colorData,
      hex: upperCaseHex, // Store in uppercase
      createdAt: serverTimestamp(),
    });
    return { success: true, message: `Color ${upperCaseHex} saved successfully!`, colorId: docRef.id };
  } catch (error: any) {
    console.error("Error saving color: ", error);
    return { success: false, message: error.message || "Failed to save color. Please try again." };
  }
}

export async function getUserSavedColors(userId: string): Promise<UserSavedColor[]> {
  if (!userId) {
    return [];
  }
  try {
    const q = query(collection(db, `users/${userId}/savedColors`), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<UserSavedColor, 'id' | 'createdAt'>),
      createdAt: docSnap.data().createdAt as Timestamp,
    }));
  } catch (error) {
    console.error("Error fetching user colors: ", error);
    return [];
  }
}

export async function deleteUserSavedColor(userId: string, colorDocId: string): Promise<{success: boolean; message: string}> {
  if (!userId) {
    return { success: false, message: "User not authenticated." };
  }
  try {
    await deleteDoc(doc(db, `users/${userId}/savedColors`, colorDocId));
    return { success: true, message: "Color deleted successfully." };
  } catch (error: any) {
    console.error("Error deleting color: ", error);
    return { success: false, message: error.message || "Failed to delete color. Please try again." };
  }
}

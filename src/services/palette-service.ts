
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, Timestamp, where, limit } from 'firebase/firestore';

export interface UserSavedPalette {
  id: string; // Firestore document ID
  name: string;
  colors: string[];
  originalPaletteId?: string; // ID from mockPalettes if it was a predefined one
  createdAt: Timestamp;
}

export interface SavePaletteData {
    name: string;
    colors: string[]; // Should be exactly 5 hex strings
    originalPaletteId?: string;
}

// Helper to check for existing palette by name (for custom) or originalPaletteId (for predefined)
async function checkExistingPalette(userId: string, paletteData: SavePaletteData): Promise<boolean> {
  let q;
  if (paletteData.originalPaletteId) {
    // Check if this predefined palette (by its original ID) is already saved by the user
    q = query(
      collection(db, `users/${userId}/savedPalettes`),
      where("originalPaletteId", "==", paletteData.originalPaletteId),
      limit(1)
    );
  } else {
    // Check if a custom palette with the same name is already saved
    q = query(
      collection(db, `users/${userId}/savedPalettes`),
      where("name", "==", paletteData.name),
      // Optionally, also check if originalPaletteId is NOT set for true custom palettes
      // where("originalPaletteId", "==", null), // or where("originalPaletteId", "not-in", ["some-value"]) if it can be undefined
      limit(1)
    );
  }
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}


export async function saveUserPalette(userId: string, paletteData: SavePaletteData): Promise<{success: boolean; message: string; paletteId?: string}> {
  if (!userId) {
    return { success: false, message: "User not authenticated." };
  }
  if (!paletteData.name || paletteData.colors.length !== 5 || !paletteData.colors.every(c => /^#[0-9A-F]{6}$/i.test(c))) {
    return { success: false, message: "Invalid palette data. Name and 5 valid hex colors are required." };
  }

  try {
    const alreadyExists = await checkExistingPalette(userId, paletteData);
    if (alreadyExists) {
        if (paletteData.originalPaletteId) {
             return { success: false, message: `Palette "${paletteData.name}" (from predefined) is already saved.` };
        }
        return { success: false, message: `A custom palette named "${paletteData.name}" already exists.` };
    }

    // Ensure colors are stored consistently, e.g., uppercase
    const normalizedColors = paletteData.colors.map(c => c.toUpperCase());

    const docRef = await addDoc(collection(db, `users/${userId}/savedPalettes`), {
      ...paletteData,
      colors: normalizedColors,
      createdAt: serverTimestamp(),
    });
    return { success: true, message: "Palette saved successfully!", paletteId: docRef.id };
  } catch (error: any) {
    console.error("Error saving palette: ", error);
    let detailedMessage = "Failed to save palette. Please try again.";
    if (error.message) {
      detailedMessage = `Failed to save palette: ${error.message}`;
    }
    return { success: false, message: detailedMessage };
  }
}

export async function getUserSavedPalettes(userId: string): Promise<UserSavedPalette[]> {
  if (!userId) {
    return [];
  }
  try {
    const q = query(collection(db, `users/${userId}/savedPalettes`), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<UserSavedPalette, 'id' | 'createdAt'>), 
      createdAt: docSnap.data().createdAt as Timestamp, 
    }));
  } catch (error) {
    console.error("Error fetching user palettes: ", error);
    return [];
  }
}

export async function deleteUserSavedPalette(userId: string, paletteDocId: string): Promise<{success: boolean; message: string}> {
  if (!userId) {
    return { success: false, message: "User not authenticated." };
  }
  try {
    await deleteDoc(doc(db, `users/${userId}/savedPalettes`, paletteDocId));
    return { success: true, message: "Palette deleted successfully." };
  } catch (error) {
    console.error("Error deleting palette: ", error);
    return { success: false, message: error.message || "Failed to delete palette. Please try again." };
  }
}

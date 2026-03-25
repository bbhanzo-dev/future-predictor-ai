import { doc, setDoc, onSnapshot, collection, addDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "./config";

const SIM_COLLECTION = "simulations";
const WORLD_DOC_ID = "main-world";

/**
 * Saves the entire world state to Firestore.
 */
export const saveWorldState = async (summary) => {
  try {
    const worldRef = doc(db, SIM_COLLECTION, WORLD_DOC_ID);
    await setDoc(worldRef, {
      ...summary,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    console.error("Error saving world state:", err);
  }
};

/**
 * Listens to real-time updates of the world state.
 */
export const subscribeToWorld = (onUpdate) => {
  const worldRef = doc(db, SIM_COLLECTION, WORLD_DOC_ID);
  return onSnapshot(worldRef, (doc) => {
    if (doc.exists()) {
      onUpdate(doc.data());
    }
  });
};

/**
 * Adds a news event to the permanent news collection.
 */
export const addNewsEvent = async (event) => {
  try {
    const newsRef = collection(db, "news");
    await addDoc(newsRef, {
      ...event,
      createdAt: Date.now()
    });
  } catch (err) {
    console.error("Error adding news event:", err);
  }
};

/**
 * Listens to the latest news events.
 */
export const subscribeToNews = (onUpdate) => {
  const newsRef = collection(db, "news");
  const q = query(newsRef, orderBy("createdAt", "desc"), limit(5));
  return onSnapshot(q, (snapshot) => {
    const news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdate(news);
  });
};

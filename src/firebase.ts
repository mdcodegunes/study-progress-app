import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCUr_F1fI7EGdWoNKF8Ax-AUUkcm_hwm1Y",
  authDomain: "study-progress-app-a8e0c.firebaseapp.com",
  projectId: "study-progress-app-a8e0c",
  // storageBucket, messagingSenderId, appId, measurementId (optional)
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Add this function to add a lesson to Firestore
export async function addLessonToFirestore(lesson: any) {
  try {
    const docRef = await addDoc(collection(db, "lessons"), lesson);
    console.log("Lesson added with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding lesson: ", e);
    throw e;
  }
}
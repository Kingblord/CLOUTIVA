import { auth, db } from "./firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection } from "firebase/firestore";

export const registerUser = async (email, password, fullName) => {
  try {
    // 1. Create Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Initialize the User Document (The "Skeleton")
    const userRef = doc(db, "users", user.uid);
    
    await setDoc(userRef, {
      uid: user.uid,
      name: fullName,
      email: email,
      balance: 0.00,
      totalSpent: 0.00,
      totalOrders: 0,
      role: "user",
      createdAt: new Date().toISOString(),
      notificationsEnabled: true
    });

    // 3. Create Empty Sub-Collections (Mechanical Necessity)
    // We add a dummy doc then delete it if needed, or just let Firestore 
    // imply the collection exists when the first real order is placed.
    // For Cloutiva, we'll initialize the trackers:
    
    const activityRef = doc(db, "users", user.uid, "history", "init");
    await setDoc(activityRef, { type: "system", message: "Account Created" });

    const ordersRef = doc(db, "users", user.uid, "orders", "init");
    await setDoc(ordersRef, { status: "none" });

    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  }
};



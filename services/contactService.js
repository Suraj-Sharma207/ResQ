import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../config/firebase";

// export const getContacts = async () => {
//   const user = auth.currentUser;
//   if (!user) return [];

//   const snapshot = await getDocs(
//     collection(db, "users", user.uid, "contacts")
//   );

//   return snapshot.docs.map((doc) => doc.data().phone);
// };

export const getContacts = async (uid) => {
  if (!uid) return [];

  const snapshot = await getDocs(
    collection(db, "users", uid, "contacts")
  );

  return snapshot.docs.map((doc) => doc.data().phone);
};
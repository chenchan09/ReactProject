import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
  addDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./database/firebaseConfig";

// ✅ Add Data (Auto-ID)
const addData = async (path, data) => {
  try {
    const ref = collection(db, path);
    await addDoc(ref, data);
    console.log("Movie added successfully!");
  } catch (error) {
    console.error("Error adding movie:", error);
  }
};

// ✅ Update Document
const updateData = async (id, path, data) => {
  try {
    const ref = doc(db, path, id);
    await updateDoc(ref, data);
    console.log(`Updated movie: ${id}`);
  } catch (error) {
    console.error("Error updating movie:", error);
  }
};

// ✅ Get Data (Supports Multiple `where()` Conditions)
const getData = async (path, whereConditions = [], orderByField = null, orderDirection = "desc", limitCount= 10) => {
  try {
    let dataQuery = collection(db, path);

    if (whereConditions.length > 0) {
      dataQuery = query(dataQuery, ...whereConditions);
    }
    if (orderByField) {
      dataQuery = query(dataQuery, orderBy(orderByField, orderDirection));  
    } else {
      dataQuery = query(dataQuery, limit(limitCount)); // If no order field, just apply limit
    }
    const querySnapshot = await getDocs(dataQuery);

    if (querySnapshot.empty) {
      //console.warn(`No documents found in collection: ${path}`);
      return [];
    }

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error getting ${path}:`, error);
    return [];
  }
};

// ✅ Update Search Count (Fixes Async Issue)
const updateSearchCount = async (path, searchTerm, movieResult) => {
  const datalist = await getData(path, [where("searchTerm", "==", searchTerm)]);

  if (datalist.length > 0) {
    await Promise.all(
      datalist.map(async (data) => {
        await updateData(data.id, path, { count: data.count + 1 });
      })
    );
  } else {
    await addData(path, {
      count: 1,
      searchTerm,
      movie_id:movieResult.id,
      posterUrl: `https://image.tmdb.org/t/p/w500${movieResult.poster_path}`,
      title:movieResult.title,
    });
  }
};


const getTrendingMovie = async() => {
  const res = await getData('movies', [], 'count', 'desc');
  return res;
  //console.log(res);
}
// ✅ Export Context
const context = {
  add: addData,
  update: updateData,
  get: getData,
  updateSearchCount: updateSearchCount,
  getTrendingMovie
};

export default context;

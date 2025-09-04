import axios from 'axios';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

// Add Firebase token to requests
// api.interceptors.request.use(async (config) => {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (user) {
//         const token = await user.getIdToken();
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });
async function getIdTokenSafe(): Promise<string> {
  return new Promise((resolve, reject) => {
    const auth = getAuth();

    // Wait until Firebase finishes restoring session
    onAuthStateChanged(
      auth,
      async (user: User | null) => {
        if (!user) {
          reject(new Error("User not logged in"));
          return;
        }
        try {
          const token = await user.getIdToken();
          resolve(token);
        } catch (err) {
          reject(err);
        }
      },
      reject
    );
  });
}

export interface WordResponse {
    words: Array<{
        word: string;
        sentence: string;
        type: string;
    }>;
}

export async function submitGrade(gradeName: string) {
    try {
        const response = await api.post('/grade/', { grade:gradeName });
        return response.data;
    } catch (error) {
        console.error('Error fetching words:', error);
        throw error;
    }
}
export async function saveUserData( userDetails: Record<string, any>) {
    try {
        const auth = getAuth();
         const user = auth.currentUser;
         const idToken = await user?.getIdToken();
        const response = await api.post('/save-user-data', {
            idToken,
            email: userDetails.email,
            name: userDetails.name,
        });
        return response.data;
    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
    
}
    export async function addChild(child: { name: string; age: number; grade: string }) {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const idToken = await user?.getIdToken();
            const response = await api.post('/add_child/', {
                idToken,
                name: child.name,
                age: child.age,
                grade: child.grade.replace(/ grade$/i, '').trim(),
            });
            return response.data;
        } catch (error) {
            console.error('Error adding child:', error);
            throw error;
        }
    }
    export async function submitWords(results:{ word: string; user_input: string; type: string }[], childId: any) {
        try {
             const auth = getAuth();
            const user = auth.currentUser;
            const idToken = await user?.getIdToken();
            const response = await api.post('/submit_words/', {
                idToken: idToken,
                child_id: childId,
                words: results,
            });
            console.log('result from backend', response.data);
            return response.data;
        } catch (error) {
            console.error('Error submitting words:', error);
            throw error;
        }
    }

    export async function fetchChild() {
        try {
         
            const idToken = await getIdTokenSafe();
            const response = await api.post('/get_children/', {
                idToken: idToken,
            });
            console.log("response from fetch child", response.data);
            return response.data.children;
        } catch (error) {
            console.error('Error fetching child:', error);
            throw error;
        }
    }


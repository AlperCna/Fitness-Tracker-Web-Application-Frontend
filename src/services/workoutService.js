// src/services/workoutService.js
import api from "./api";

// ✔ 1300+ egzersizi almak (Autocomplete için)
export const getAllExercisesForSearch = async () => {
    try {
        const res = await api.get("/exercises");
        return res.data.content || res.data;
    } catch (error) {
        console.error("Egzersiz listesi alınamadı:", error);
        throw error;
    }
};

// ✔ Workout oluşturmak
export const createWorkout = async (workoutData) => {
    try {
        const res = await api.post("/workouts", workoutData);
        return res.data;
    } catch (error) {
        console.error("Antrenman kaydedilirken hata:", error);
        throw error;
    }
};

"use server";

export async function createTraining(formData: FormData) {
    // Implementation for creating training
    console.log("Creating training:", formData.get("title"));
}

export async function updateTraining(id: string, formData: FormData) {
    // Implementation for updating training
}

export async function deleteTraining(id: string) {
    // Implementation for deleting training
}

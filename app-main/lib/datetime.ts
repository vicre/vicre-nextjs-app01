export function formatDateTime(rawDate?: string): string {
    if (!rawDate) return "N/A";
  
    const dt = new Date(rawDate);
    if (isNaN(dt.getTime())) {
      // If invalid date, handle gracefully
      return "N/A";
    }
  
    // Extract parts
    const hours = dt.getHours().toString().padStart(2, "0");
    const minutes = dt.getMinutes().toString().padStart(2, "0");
    const day = dt.getDate().toString().padStart(2, "0");
    const month = (dt.getMonth() + 1).toString().padStart(2, "0");
    const year = dt.getFullYear();
  
    // Build "HH:mm dd-mm-yyyy"
    return `${hours}:${minutes} ${day}-${month}-${year}`;
  }
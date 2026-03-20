import axios from "axios";

// Using production Render URL as requested
const baseURL = "https://branchflow.onrender.com/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000 
});

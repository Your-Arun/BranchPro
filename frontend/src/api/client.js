import axios from "axios";

// Using production Render URL as requested
const baseURL = "https://branchpro.onrender.com/api";

export const api = axios.create({
  baseURL,
  timeout: 40000 
});
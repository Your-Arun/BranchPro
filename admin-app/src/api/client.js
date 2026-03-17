import axios from "axios";

const baseURL = "https://branchpro.onrender.com/api";

export const api = axios.create({
  baseURL,
  timeout: 10000
});

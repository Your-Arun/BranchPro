import axios from "axios";

const baseURL = "http://192.168.1.6:5000/api";

export const api = axios.create({
  baseURL,
  timeout: 10000
});

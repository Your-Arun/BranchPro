import axios from "axios";

const baseURL =  "http://192.168.1.3:5000/api";

export const api = axios.create({
  baseURL,
  timeout: 10000
});

import axios from "axios";

const instance = axios.create({
  baseURL: "https://<api-gatewaya-url>/<stage>",
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;

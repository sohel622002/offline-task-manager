const server = require("./app");
const getLocalIP = require("./utils/ip");

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  const ip = getLocalIP();
  console.log("🚀 Server running at:");
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`👉 http://${ip}:${PORT}`);
});

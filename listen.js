const app = require("./app/app");
const PORT = process.env.PORT || 9090;

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});

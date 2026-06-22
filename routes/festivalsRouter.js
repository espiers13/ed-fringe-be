router.get("/events", async (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  const signature = CryptoJS.HmacSHA1(
    query,
    process.env.FESTIVAL_SECRET,
  ).toString();
  const url = `https://api.edinburghfestival.com/...?${query}&signature=${signature}`;
  const response = await axios.get(url);
  res.json(response.data);
});

const express = require("express");
const router = express.Router();
const axios = require("axios");
const CryptoJS = require("crypto-js");

router.get("/events", async (req, res) => {
  try {
    const {
      page = 1,
      size = 25,
      date = "",
      genre = "",
      lat = "",
      lon = "",
      distance = "",
      code = "",
    } = req.query;

    let path = `festival=fringe&from=${page}&size=${size}`;

    if (code) path += `&code=${code}`;
    if (date) {
      path += `&date_from=${encodeURIComponent(date + " 00:00:00")}`;
      path += `&date_to=${encodeURIComponent(date + " 23:59:59")}`;
    }
    if (genre) path += `&genre=${encodeURIComponent(genre)}`;
    if (lat && lon) {
      path += `&lat=${lat}&lon=${lon}`;
      if (distance) path += `&distance=${distance}`;
    }
    path += `&key=${process.env.FESTIVAL_API_KEY}`;

    const fullPath = `/events?${path}`;

    const signature = CryptoJS.HmacSHA1(
      fullPath,
      process.env.FESTIVAL_SECRET,
    ).toString(CryptoJS.enc.Hex);
    const signedPath = `${fullPath}&signature=${signature}`;

    const response = await axios.get(
      `http://api.edinburghfestivalcity.com${signedPath}`,
    );
    res.json(response.data);
  } catch (err) {
    console.error("Festival API error:", err.message, err.response?.data);
    res.status(err.response?.status || 500).json({ msg: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    const encoded = encodeURIComponent(query);
    const baseParams = `festival=fringe&key=${process.env.FESTIVAL_API_KEY}`;

    const titleQuery = `festival=fringe&key=${process.env.FESTIVAL_API_KEY}&title=${encoded}`;
    const artistQuery = `festival=fringe&key=${process.env.FESTIVAL_API_KEY}&artist=${encoded}`;

    const [titleRes, artistRes] = await Promise.all([
      axios.get(
        `http://api.edinburghfestivalcity.com/events?${titleQuery}&signature=${CryptoJS.HmacSHA1(titleQuery, process.env.FESTIVAL_SECRET).toString(CryptoJS.enc.Hex)}`,
      ),
      axios.get(
        `http://api.edinburghfestivalcity.com/events?${artistQuery}&signature=${CryptoJS.HmacSHA1(artistQuery, process.env.FESTIVAL_SECRET).toString(CryptoJS.enc.Hex)}`,
      ),
    ]);

    const combined = [...titleRes.data, ...artistRes.data];
    const unique = combined.filter(
      (event, index, self) =>
        index === self.findIndex((e) => e.url === event.url),
    );

    res.json(unique);
  } catch (err) {
    console.error("Festival API error:", err.message, err.response?.data);
    res.status(err.response?.status || 500).json({ msg: err.message });
  }
});

router.get("/events/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const path = `/events?festival=fringe&code=${code}&key=${process.env.FESTIVAL_API_KEY}`;
    const signature = CryptoJS.HmacSHA1(
      path,
      process.env.FESTIVAL_SECRET,
    ).toString(CryptoJS.enc.Hex);

    const response = await axios.get(
      `https://api.edinburghfestivalcity.com${path}&signature=${signature}`,
    );
    res.json(response.data[0] ?? null);
  } catch (err) {
    console.error("Festival API error:", err.message, err.response?.data);
    res.status(err.response?.status || 500).json({ msg: err.message });
  }
});

module.exports = router;

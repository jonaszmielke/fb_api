const express = require('express');
const router = express.Router();

router.get("/router_test", (req, res) => {

    console.log(`GET request on /api/router_test from ${req.ip}`)
    res.status(200)
    res.json({message: 'hello router test!'});
});


module.exports = router;
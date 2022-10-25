const router = require("express").Router();

const {initiateSTKPush,stkPushCallback,confirmPayment} = require("../controllers/payment");
const accessToken = require("../utils/auth");

router.post('/stkPush',accessToken,initiateSTKPush);
router.post('/stkPushCallback/:Order_ID',stkPushCallback);
router.post('/confirmPayment/:CheckoutRequestID',accessToken,confirmPayment);


module.exports = router;

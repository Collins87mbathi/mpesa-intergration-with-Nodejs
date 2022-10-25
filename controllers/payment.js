const request = require("request");
const dotenv = require("dotenv");
dotenv.config();
const {getTimestamp} = require("../utils/timestamp");
const ngrok = require("ngrok");
const Payments = require("../models/Payments");

// @desc initiate stk push
// @method POST
// @route /stkPush
// @access public
const initiateSTKPush = async(req, res) => {
    try{

        const {amount, phone,Order_ID} = req.body
        const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        const auth = "Bearer " + req.safaricom_access_token

        const timestamp = getTimestamp()

        //shortcode + passkey + timestamp
        const password = new Buffer.from(process.env.BUSINESS_SHORT_CODE + process.env.PASS_KEY + timestamp).toString('base64')

        // create callback url
        const callback_url = await ngrok.connect(process.env.PORT);
        const api = ngrok.getApi();
        await api.listTunnels();


        console.log("callback ",callback_url)
        request(
            {
                url: url,
                method: "POST",
                headers: {
                    "Authorization": auth
                },
                json: {
                    "BusinessShortCode": process.env.BUSINESS_SHORT_CODE,
                    "Password": password,
                    "Timestamp": timestamp,
                    "TransactionType": "CustomerPayBillOnline",
                    "Amount": amount,
                    "PartyA": phone,
                    "PartyB": process.env.BUSINESS_SHORT_CODE,
                    "PhoneNumber": phone,
                    "CallBackURL": `${callback_url}/api/stkPushCallback/${Order_ID}`,
                    "AccountReference": "Perez Grocery Shop",
                    "TransactionDesc": "Online Payment"
                }
            },
            function (e, response, body) {
                if (e) {
                    console.error(e)
                    res.status(503).send({
                        message:"Error with the stk push",
                        error : e
                    })
                } else {
                    res.status(200).json(body)
                }
            }
        )
    }catch (e) {
        console.error("Error while trying to create LipaNaMpesa details",e)
        res.status(503).send({
            message:"Something went wrong while trying to create LipaNaMpesa details. Contact admin",
            error: e
        })
    }
}


// @desc callback route Safaricom will post transaction status
// @method POST
// @route /stkPushCallback/:Order_ID
// @access public
 const stkPushCallback = async(req, res) => {
    try{

    //    order id
        const {Order_ID} = req.params

        //callback details

        const {
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata
                 }   = req.body.Body.stkCallback

    //     get the meta data from the meta
        const meta = Object.values(await CallbackMetadata.Item)
        const PhoneNumber = meta.find(o => o.Name === 'PhoneNumber').Value.toString()
        const Amount = meta.find(o => o.Name === 'Amount').Value.toString()
        const MpesaReceiptNumber = meta.find(o => o.Name === 'MpesaReceiptNumber').Value.toString()
        const TransactionDate = meta.find(o => o.Name === 'TransactionDate').Value.toString()
        
        //saving the transaction to the database
        const onlinePayment = new Payments({
            Order_ID,
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            PhoneNumber,
            Amount, 
            MpesaReceiptNumber,
            TransactionDate 
        });
      await onlinePayment.save();
        res.json(true)
    }catch (e) {
        console.error("Error while trying to update LipaNaMpesa details from the callback",e)
        res.status(503).send({
            message:"Something went wrong with the callback",
            error : e.message
        })
    }
}

// @desc Check from safaricom servers the status of a transaction
// @method GET
// @route /confirmPayment/:CheckoutRequestID
// @access public
 const confirmPayment = async(req, res) => {
    try{


        const url = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query"
        const auth = "Bearer " + req.safaricom_access_token

        const timestamp = getTimestamp()
        //shortcode + passkey + timestamp
        const password = new Buffer.from(process.env.BUSINESS_SHORT_CODE + process.env.PASS_KEY + timestamp).toString('base64')


        request(
            {
                url: url,
                method: "POST",
                headers: {
                    "Authorization": auth
                },
                json: {
                    "BusinessShortCode":process.env.BUSINESS_SHORT_CODE,
                    "Password": password,
                    "Timestamp": timestamp,
                    "CheckoutRequestID": req.params.CheckoutRequestID,

                }
            },
            function (error, response, body) {
                if (error) {
                    console.log(error)
                    res.status(503).send({
                        message:"Something went wrong while trying to create LipaNaMpesa details. Contact admin",
                        error : error
                    })
                } else {
                    res.status(200).json(body)
                }
            }
        )
    }catch (e) {
        console.error("Error while trying to create LipaNaMpesa details",e)
        res.status(503).send({
            message:"Something went wrong while trying to create LipaNaMpesa details. Contact admin",
            error : e
        })
    }
}

module.exports = {
    stkPushCallback,
    initiateSTKPush,
    confirmPayment
};
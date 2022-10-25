const mongoose = require("mongoose");

const PaymentsSchema = new mongoose.Schema({
    Order_ID : {
        type : String,
    },
    MerchantRequestID: {
        type : String,
    },
    CheckoutRequestID: {
        type : String,
    },
    ResultCode: {
        type : Number,
    },
    ResultDesc: {
        type : String,
    },
    Amount: {
        type : String,
    },
    MpesaReceiptNumber: {
        type : String,
    },
    TransactionDate: {
        type : Date
    }
});

module.exports = mongoose.model("Payments", PaymentsSchema);
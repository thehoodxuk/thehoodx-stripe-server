const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const stripe = Stripe("TON_SECRET_KEY_STRIPE");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {

const items = req.body.items;

const line_items = items.map(item => ({
price_data: {
currency: "cad",
product_data: {
name: item.name
},
unit_amount: item.price * 100
},
quantity: 1
}));

const session = await stripe.checkout.sessions.create({

payment_method_types: ["card"],

line_items,

mode: "payment",

success_url: "http://localhost:3000/success.html",

cancel_url: "http://localhost:3000/cancel.html"

});

res.json({ url: session.url });

});

app.listen(3000, () => console.log("Server running"));
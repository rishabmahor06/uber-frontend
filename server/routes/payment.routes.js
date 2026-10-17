const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/auth.middleware");
const paymentController = require("../controllers/payment.controller");

const rideId = body("rideId").isMongoId().withMessage("invalid rideId");

router.get("/config", paymentController.config);
router.post("/create-order", authMiddleware.authUser, rideId, paymentController.createOrder);
router.post("/verify", authMiddleware.authUser, rideId, paymentController.verify);
router.post("/cash", authMiddleware.authUser, rideId, paymentController.cash);

module.exports = router;

const paymentService = require("../services/payment.service");
const { withoutOtp } = require("./ride.controller");
const { validationResult } = require("express-validator");

const fail = (res, err) => {
  const status = err?.response?.status === 401 ? 502 : err?.status || 500;
  if (status >= 500) console.error("payment error:", err?.response?.data || err.message);
  const message =
    status >= 500 && !err?.status
      ? "Payment service error. Please try again."
      : err.message;
  return res.status(status).json({ message });
};

const invalid = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ message: errors.array()[0].msg });
  return true;
};

module.exports.config = (req, res) =>
  res.status(200).json({ enabled: paymentService.isConfigured(), key: paymentService.publicKey() || null });

module.exports.createOrder = async (req, res) => {
  if (invalid(req, res)) return;
  try {
    const { order, key } = await paymentService.createOrder(req.body.rideId, req.user._id);
    res.status(200).json({
      key,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    fail(res, err);
  }
};

module.exports.verify = async (req, res) => {
  if (invalid(req, res)) return;
  try {
    const ride = await paymentService.verifyPayment(req.body.rideId, req.user._id, req.body);
    res.status(200).json(withoutOtp(ride));
  } catch (err) {
    fail(res, err);
  }
};

module.exports.cash = async (req, res) => {
  if (invalid(req, res)) return;
  try {
    res.status(200).json(withoutOtp(await paymentService.payByCash(req.body.rideId, req.user._id)));
  } catch (err) {
    fail(res, err);
  }
};

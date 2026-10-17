import axios from "@/utils/axios";

const SDK = "https://checkout.razorpay.com/v1/checkout.js";

const loadSdk = () =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Browser only"));
    if (window.Razorpay) return resolve();
    const existing = document.querySelector(`script[src="${SDK}"]`);
    const script = existing || document.createElement("script");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Couldn't load Razorpay. Check your connection.")));
    if (!existing) {
      script.src = SDK;
      script.async = true;
      document.body.appendChild(script);
    }
  });

export const getPaymentConfig = async () => (await axios.get("/payment/config")).data;

/**
 * Opens Razorpay Checkout for a completed ride.
 * Resolves with the updated ride once the payment is verified on the server,
 * resolves null if the rider closes the popup, rejects on failure.
 */
export const PAY_MODES = [
  { id: "gpay", label: "Google Pay", icon: "G", color: "#4285f4", method: "upi", app: "google_pay" },
  { id: "phonepe", label: "PhonePe", icon: "पे", color: "#5f259f", method: "upi", app: "phonepe" },
  { id: "paytm", label: "Paytm", icon: "P", color: "#00baf2", method: "upi", app: "paytm" },
  { id: "upi", label: "UPI ID / QR", icon: "₹", color: "#0b1437", method: "upi" },
  { id: "card", label: "Credit / Debit card", icon: "💳", color: "#111827", method: "card" },
  { id: "netbanking", label: "Net banking", icon: "🏦", color: "#065f46", method: "netbanking" },
];

// Checkout config that opens straight on the chosen payment mode.
const modeOptions = (mode) => {
  if (!mode) return {};
  const instrument = { method: mode.method, ...(mode.app ? { apps: [mode.app] } : {}) };
  return {
    config: {
      display: {
        blocks: { chosen: { name: `Pay with ${mode.label}`, instruments: [instrument] } },
        sequence: ["block.chosen"],
        preferences: { show_default_blocks: false },
      },
    },
    prefill: { method: mode.method },
  };
};

export async function payRide(ride, prefill = {}, mode = null) {
  await loadSdk();
  const { data: order } = await axios.post("/payment/create-order", { rideId: ride._id });

  const extra = modeOptions(mode);
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      ...extra,
      key: order.key,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: "Speed",
      description: `Ride: ${ride.pickup} → ${ride.destination}`.slice(0, 250),
      prefill: { ...prefill, ...extra.prefill },
      theme: { color: "#0b1437" },
      handler: async (response) => {
        try {
          const { data } = await axios.post("/payment/verify", {
            rideId: ride._id,
            ...response,
          });
          resolve(data);
        } catch (err) {
          reject(err);
        }
      },
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.on("payment.failed", (res) =>
      reject(new Error(res?.error?.description || "Payment failed"))
    );
    rzp.open();
  });
}

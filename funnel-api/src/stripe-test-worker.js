import { handleStripeTest } from "./stripe-test.js";

// Intentionally separate from the no-payment demo Worker.
// No production or live Stripe payment path is compiled into this entrypoint.
export default {
  fetch(request, env) {
    return handleStripeTest(request, env);
  }
};

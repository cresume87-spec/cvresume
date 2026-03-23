"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { ALLOWED_COUNTRIES } from "@/lib/countries";

type CheckoutData = {
  email: string;
  planId: string;
  total: number;
  currency: string;
  amount?: number;
};

type CheckoutValues = {
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  countryCode: string;
};

const INITIAL_VALUES: CheckoutValues = {
  cardNumber: "",
  expiry: "",
  cvv: "",
  name: "",
  address: "",
  city: "",
  postalCode: "",
  countryCode: "",
};

export default function CheckoutClient({ withoutPayment }: { withoutPayment: boolean }) {
  const router = useRouter();
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("checkoutData");
    if (!data) {
      router.push("/pricing");
      return;
    }

    try {
      const parsed = JSON.parse(data);
      const normalized = {
        ...parsed,
        vatRate: 0,
        vatAmount: 0,
        total: typeof parsed?.amount === "number" ? parsed.amount : parsed?.total,
      };
      localStorage.setItem("checkoutData", JSON.stringify(normalized));
      setCheckout(normalized);
    } catch {
      router.push("/pricing");
    }
  }, [router]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        cardNumber: withoutPayment
          ? Yup.string()
          : Yup.string()
              .matches(/^[0-9 ]+$/, "Only digits allowed")
              .min(19, "Invalid card number")
              .required("Required"),
        expiry: withoutPayment
          ? Yup.string()
          : Yup.string()
              .matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "MM/YY")
              .required("Required"),
        cvv: withoutPayment
          ? Yup.string()
          : Yup.string().matches(/^[0-9]{3,4}$/, "Invalid CVV").required("Required"),
        name: Yup.string().required("Required"),
        address: Yup.string().required("Required"),
        city: Yup.string().required("Required"),
        postalCode: Yup.string().required("Required"),
        countryCode: Yup.string().required("Required"),
      }),
    [withoutPayment],
  );

  const formatCardNumber = (value: string) =>
    value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();

  const formatExpiry = (value: string) =>
    value.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(?=\d)/, "$1/").trim();

  const pollStatus = async (orderMerchantId: string) => {
    setPolling(true);

    let attempts = 0;
    const maxAttempts = 30;

    const interval = setInterval(async () => {
      attempts += 1;

      const res = await fetch("/api/cardserv/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderMerchantId }),
      });

      const json = await res.json();

      if (json?.redirectUrl) {
        clearInterval(interval);
        setPolling(false);
        window.location.href = json.redirectUrl;
        return;
      }

      if (json?.state === "APPROVED") {
        clearInterval(interval);
        setPolling(false);
        localStorage.removeItem("orderMerchantId");
        router.push("/dashboard");
        return;
      }

      if (json?.state === "DECLINED" || json?.state === "ERROR") {
        clearInterval(interval);
        setPolling(false);
        setPaymentError("Payment was declined by the gateway. Please try another card.");
        return;
      }

      const transientNotFound = json?.transientNotFound === true;
      if (attempts >= maxAttempts || (json?.state === "UNKNOWN" && !transientNotFound)) {
        clearInterval(interval);
        setPolling(false);
        setPaymentError("Payment is still processing. Please check the Payment Processing page again in a moment.");
      }
    }, 2000);
  };

  const handleSubmit = async (
    values: CheckoutValues,
    { setSubmitting }: { setSubmitting: (value: boolean) => void },
  ) => {
    try {
      setLoading(true);
      setPaymentError(null);

      const payload = {
        ...checkout,
        countryCode: values.countryCode,
        card: withoutPayment ? undefined : values,
        name: values.name,
        address: values.address,
        city: values.city,
        postalCode: values.postalCode,
      };

      const res = await fetch("/api/cardserv/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        const reason = data?.errorMessage || data?.error || "Payment initialization failed";
        console.error("[CHECKOUT_SUBMIT_ERROR]", reason, data);
        setPaymentError(reason);
        return;
      }

      const orderId =
        data?.orderMerchantId ||
        data?.data?.orderMerchantId ||
        data?.raw?.orderMerchantId ||
        null;

      if (orderId) {
        localStorage.setItem("orderMerchantId", orderId);
      }

      if (data?.state === "APPROVED" && !data?.redirectUrl) {
        localStorage.removeItem("orderMerchantId");
        router.push("/dashboard");
        return;
      }

      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      const threeDS =
        data?.threeDSAuth ||
        data?.threeDS ||
        data?.data?.threeDS ||
        data?.raw?.status?.threeDSAuth ||
        data?.raw?.sale?.threeDSAuth;

      if (threeDS?.acsUrl && (threeDS?.paReq || threeDS?.creq) && orderId) {
        const termUrl = `${window.location.origin}/api/cardserv/result?order=${orderId}`;

        const form = document.createElement("form");
        form.method = "POST";
        form.action = threeDS.acsUrl;
        form.style.display = "none";

        if (threeDS.paReq) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = "PaReq";
          input.value = threeDS.paReq;
          form.appendChild(input);
        }

        if (threeDS.creq) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = "creq";
          input.value = threeDS.creq;
          form.appendChild(input);
        }

        const termUrlInput = document.createElement("input");
        termUrlInput.type = "hidden";
        termUrlInput.name = "TermUrl";
        termUrlInput.value = termUrl;
        form.appendChild(termUrlInput);

        const mdInput = document.createElement("input");
        mdInput.type = "hidden";
        mdInput.name = "MD";
        mdInput.value = orderId;
        form.appendChild(mdInput);

        document.body.appendChild(form);
        form.submit();
        return;
      }

      if (orderId) {
        await pollStatus(orderId);
      }
    } catch (error) {
      console.error("[CHECKOUT_UNEXPECTED_ERROR]", error);
      setPaymentError("Unexpected payment error. Please try again.");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (!checkout) {
    return null;
  }

  const total = Number(checkout.total || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 grid md:grid-cols-2 overflow-hidden">
        <div className="p-8 md:p-10">
          <h1 className="text-2xl font-semibold text-gray-800 mb-8">
            {withoutPayment ? "Test purchase details" : "Payment details"}
          </h1>

          {withoutPayment ? (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Test mode is enabled. CardServ will be bypassed, tokens will be credited immediately,
              and the PDF invoice will be emailed after the order is approved.
            </div>
          ) : null}

          {paymentError ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {paymentError}
            </div>
          ) : null}

          <Formik
            initialValues={INITIAL_VALUES}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form className="space-y-5">
                {!withoutPayment ? (
                  <>
                    <div>
                      <label className="text-sm text-gray-600">Card number</label>
                        <Field
                          name="cardNumber"
                          value={values.cardNumber}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setFieldValue("cardNumber", formatCardNumber(e.target.value))
                          }
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                      />
                      <ErrorMessage name="cardNumber" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-sm text-gray-600">Expiry</label>
                        <Field
                          name="expiry"
                          value={values.expiry}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setFieldValue("expiry", formatExpiry(e.target.value))
                          }
                          placeholder="MM/YY"
                          maxLength={5}
                          className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <ErrorMessage name="expiry" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm text-gray-600">CVV</label>
                        <Field
                          name="cvv"
                          type="password"
                          placeholder="123"
                          maxLength={4}
                          className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <ErrorMessage name="cvv" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>
                  </>
                ) : null}

                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <Field
                    name="name"
                    placeholder="John Doe"
                    className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Address</label>
                  <Field
                    name="address"
                    placeholder="123 Main Street"
                    className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <ErrorMessage name="address" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">City</label>
                    <Field
                      name="city"
                      placeholder="London"
                      className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <ErrorMessage name="city" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">Postal code</label>
                    <Field
                      name="postalCode"
                      placeholder="E1 6AN"
                      className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <ErrorMessage name="postalCode" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Country</label>
                  <Field
                    as="select"
                    name="countryCode"
                    className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="">Select country</option>
                    {ALLOWED_COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="countryCode" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <Button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 mt-4"
                  size="lg"
                  disabled={isSubmitting || loading || polling}
                >
                  {loading || polling ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {polling ? "Awaiting confirmation..." : "Processing..."}
                    </>
                  ) : withoutPayment ? (
                    <>Complete test purchase</>
                  ) : (
                    <>Pay {total.toFixed(2)} {checkout.currency}</>
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        </div>

        <div className="bg-gray-50 border-l border-gray-100 p-8 md:p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span>Plan</span>
                <span className="font-medium">{checkout.planId}</span>
              </div>
              <div className="flex justify-between">
                <span>Price</span>
                <span>{total.toFixed(2)} {checkout.currency}</span>
              </div>
              <div className="border-t border-gray-300 my-3"></div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{total.toFixed(2)} {checkout.currency}</span>
              </div>
            </div>
            <p className="mt-5 text-sm text-gray-500">
              Invoice will be sent to <b>{checkout.email}</b>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

package com.agriconnect.notification.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class EmailTemplateService {


    public String buyerOrderPlaced(String buyerName, String orderId,
                                   String listingTitle, Double quantity,
                                   BigDecimal total, String farmerName) {
        return baseTemplate(
                "Order Confirmed — " + listingTitle,
                """
                <p>Hi <strong>%s</strong>,</p>
                <p>Your order has been placed successfully.
                   We've sent an M-Pesa payment prompt to your phone.</p>
                """.formatted(buyerName),
                new String[][]{
                        {"Order ID",  "#" + orderId.substring(0, 8).toUpperCase()},
                        {"Item",      listingTitle},
                        {"Quantity",  quantity + " units"},
                        {"Total",     "KES " + total.toString()},
                        {"Seller",    farmerName},
                },
                "Please complete the M-Pesa payment on your phone to confirm your order.",
                "#f59e0b", "⏳ Awaiting Payment"
        );
    }

    public String buyerOrderConfirmed(String buyerName, String orderId,
                                      String listingTitle, Double quantity,
                                      BigDecimal total, String farmerName) {
        return baseTemplate(
                "Payment Received — Your Order is Confirmed!",
                """
                <p>Hi <strong>%s</strong>,</p>
                <p>Your M-Pesa payment was received and your order
                   is now confirmed. The farmer will begin processing
                   your order shortly.</p>
                """.formatted(buyerName),
                new String[][]{
                        {"Order ID",  "#" + orderId.substring(0, 8).toUpperCase()},
                        {"Item",      listingTitle},
                        {"Quantity",  quantity + " units"},
                        {"Total",     "KES " + total},
                        {"Seller",    farmerName},
                        {"Status",    "Confirmed ✓"},
                },
                "Thank you for using AgriConnect. We'll notify you when your order ships.",
                "#1a3d2b", "Payment Confirmed"
        );
    }
    public String farmerNewOrder(String farmerName, String orderId,
                                 String listingTitle, Double quantity,
                                 BigDecimal total, String buyerPhone) {
        return baseTemplate(
                "New Order Received — " + listingTitle,
                """
                <p>Hi <strong>%s</strong>,</p>
                <p>You have a new order on AgriConnect!
                   The buyer is completing M-Pesa payment now.</p>
                """.formatted(farmerName),
                new String[][]{
                        {"Order ID",     "#" + orderId.substring(0, 8).toUpperCase()},
                        {"Item ordered", listingTitle},
                        {"Quantity",     quantity + " units"},
                        {"Amount",       "KES " + total},
                        {"Buyer phone",  buyerPhone},
                        {"Status",       "Awaiting payment"},
                },
                "We'll send another email once the buyer completes payment.",
                "#f59e0b", "New Order"
        );
    }

    public String farmerPaymentReceived(String farmerName, String orderId,
                                        String listingTitle, Double quantity,
                                        BigDecimal total, String buyerPhone) {
        return baseTemplate(
                "Payment Received — " + listingTitle,
                """
                <p>Hi <strong>%s</strong>,</p>
                <p>Great news! The buyer has completed M-Pesa payment
                   for their order. Please prepare the goods for delivery.</p>
                """.formatted(farmerName),
                new String[][]{
                        {"Order ID",     "#" + orderId.substring(0, 8).toUpperCase()},
                        {"Item",         listingTitle},
                        {"Quantity",     quantity + " units"},
                        {"Amount",       "KES " + total},
                        {"Buyer phone",  buyerPhone},
                        {"Status",       "Payment confirmed ✓"},
                },
                "Please contact the buyer to arrange delivery or pickup.",
                "#1a3d2b", "💰 Payment Received"
        );
    }

    private String baseTemplate(String title, String intro,
                                String[][] details, String footer,
                                String accentColor, String badge) {

        StringBuilder rows = new StringBuilder();
        for (String[] row : details) {
            rows.append("""
                <tr>
                  <td style="padding:8px 12px;color:#6b7280;
                             font-size:13px;border-bottom:
                             1px solid #f3f4f6;">%s</td>
                  <td style="padding:8px 12px;font-weight:500;
                             font-size:13px;border-bottom:
                             1px solid #f3f4f6;text-align:right;">%s</td>
                </tr>
                """.formatted(row[0], row[1]));
        }

        return """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#f8f7f4;
                         font-family:Arial,sans-serif;">
              <div style="max-width:520px;margin:32px auto;
                          background:#fff;border-radius:12px;
                          border:1px solid #e5e7eb;overflow:hidden;">
                <div style="background:%s;padding:24px 32px;">
                  <p style="margin:0;font-size:11px;font-weight:600;
                             color:rgba(255,255,255,0.8);
                             letter-spacing:0.1em;text-transform:uppercase;">
                    AgriConnect
                  </p>
                  <h1 style="margin:8px 0 0;font-size:20px;color:#fff;
                              font-weight:700;">%s</h1>
                </div>

                <!-- Body -->
                <div style="padding:28px 32px;">
                  <div style="font-size:14px;color:#374151;
                               line-height:1.6;margin-bottom:24px;">
                    %s
                  </div>
                  <table style="width:100%%;border-collapse:collapse;
                                background:#f9fafb;border-radius:8px;
                                overflow:hidden;margin-bottom:24px;">
                    %s
                  </table>
                  <p style="font-size:12px;color:#9ca3af;
                             line-height:1.6;margin:0;">
                    %s
                  </p>
                </div>
                <div style="padding:16px 32px;border-top:1px solid #f3f4f6;
                             background:#f9fafb;">
                  <p style="margin:0;font-size:11px;color:#9ca3af;">
                    © %d AgriConnect · Built for Kenyan agriculture
                  </p>
                </div>
              </div>
            </body>
            </html>
           \s""".formatted(
                accentColor, badge, intro,
                rows.toString(), footer,
                java.time.Year.now().getValue()
        );
    }
}
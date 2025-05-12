export const generateSimpleSellerOrderNotificationTemplate = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #dddddd;
        }
        .header {
            text-align: center;
            background-color: #0a74da;
            color: #ffffff;
            padding: 10px 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
        }
        .content p {
            font-size: 16px;
            color: #333333;
        }
        .button {
            display: inline-block;
            background-color: #0a74da;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #777777;
            background-color: #f4f4f4;
        }
        .footer a {
            color: #0a74da;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Congratulations 🎉 New Order Received</h1>
        </div>

        <div class="content">
            <p>Hi there,</p>
            <p>You have received a new order! To view the details and start processing the order, please visit your admin dashboard.</p>

            <a href="${process.env.HOST}/dashboard/orders" class="button">Go to Admin Dashboard</a>
        </div>

        <div class="footer">
            <p>Congratulations on your new order 🎊🎊🎉</p>
        </div>
    </div>
</body>
</html>
`;

export const generateBuyerOrderStatusEmail = ({ status, firstName, items, trackingId }) => {
    const statusMessage = status === 'processing'
        ? 'Your order is now being processed.'
        : 'Your order has been shipped and is on its way!';
    
    const itemsHtml = items.map(item => `
        <div style="display: flex; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
            <img src="${item.image}" alt="${item.name}" width="80" style="border-radius: 4px;" />
            <div style="margin: 10px;">
                <h4 style="margin: 0 0 5px;">${item.name}</h4>
                <p style="margin: 0;">Quantity: ${item.quantity}</p>
                ${item.color ? `<p style="margin: 0;">Color: ${item.color}</p>` : ''}
                ${item.size ? `<p style="margin: 0;">Size: ${item.size}</p>` : ''}
                <p style="margin: 0;">Price: $${item.price.toFixed(2)}</p>
            </div>
        </div>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 0; margin: 0; }
            .container { max-width: 600px; margin: auto; background: white; padding: 20px; }
            h2 { color: #0a74da; }
            .footer { margin-top: 30px; font-size: 14px; color: #666; }
        </style>
        </head>
        <body>
            <div class="container">
                <h2>Order Update 📦</h2>
                <p>Hi ${firstName},</p>
                <p>${statusMessage}</p>
                <p><strong>Tracking ID:</strong> ${trackingId}</p>
                <hr/>
                ${itemsHtml}
                <div class="footer">
                <p>Thank you for shopping with us!</p>
                </div>
            </div>
        </body>
    </html>
    `;
};

export const generateBuyerDeliveredEmail = ({ firstName, items, trackingId }) => {
    const itemsHtml = items.map(item => `
        <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <h4 style="margin: 0 0 5px;">${item.name}</h4>
            <p style="margin: 0;">Quantity: ${item.quantity}</p>
            <p style="margin: 0;">Price: $${item.price.toFixed(2)}</p>
            <a href="${process.env.HOST}/review?productId=${item._id.split('-')[0]}&orderId=${trackingId}" style="color: #0a74da;">Leave a Review</a>
        </div>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: auto; background: white; padding: 20px; }
            h2 { color: #0a74da; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Order Delivered ✅</h2>
            <p>Hi ${firstName},</p>
            <p>Your order with Tracking ID <strong>${trackingId}</strong> has been delivered.</p>
            <p>When leaving a review, kindly use the Product ID listed for each item.</p>
            <p>We hope you love it! We'd really appreciate your feedback:</p>
            ${itemsHtml}
            <p>Thanks again for shopping with us!</p>
        </div>
    </body>
    </html>
    `;
};


export const generateBuyerCancelledEmail = ({ firstName, items, trackingId }) => {
    const itemsHtml = items.map(item => `
        <li>${item.name} (x${item.quantity}) - $${item.price.toFixed(2)}</li>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: auto; background: white; padding: 20px; }
            h2 { color: #d32f2f; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Order Cancelled</h2>
            <p>Hi ${firstName},</p>
            <p>We're sorry to inform you that your order with Tracking ID <strong>${trackingId}</strong> has been cancelled.</p>
            <p>Here’s a summary of what was in your order:</p>
            <ul>
            ${itemsHtml}
            </ul>
            <p>If you have any questions or need assistance, feel free to contact our support team.</p>
            <p>We hope to serve you again soon.</p>
        </div>
    </body>
    </html>
    `;
};

export const generateNegativeReviewAlertEmail = ({ customerName, productName, rating, review, orderId }) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: auto; background: white; padding: 20px; }
            h2 { color: #d32f2f; }
            .review-box { background: #fff3f3; padding: 15px; border-left: 4px solid #d32f2f; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>⚠️ New Low Rating Received</h2>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Rating:</strong> ${rating} ⭐</p>

            <div class="review-box">
                <p><strong>Review:</strong></p>
                <p>${review || 'No written feedback provided.'}</p>
            </div>

            <p>Please review and follow up with the customer if necessary.</p>
        </div>
    </body>
    </html>
    `;
};

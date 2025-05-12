import { connectToDatabase } from "@/lib/mongoose";
import Product from "../../../../models/product";
import Review from "../../../../models/review";
import Order from "../../../../models/orders";
import { uploadImage } from "@/lib/cloudinary-upload";
import { sendEmail } from "@/lib/sendEmail";
import { generateNegativeReviewAlertEmail } from "@/lib/email-template/content";

export async function POST(request) {
    const formData = await request.formData();
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const orderId = url.searchParams.get("orderId");

    console.log(productId);


    // Extract text fields
    const rating = parseInt(formData.get('rating'));
    const comment = formData.get('comment');
    const name = formData.get('name');
    
    // Get the image file if it exists
    const imageFile = formData.get('image');

    try {
        // Parse the FormData from the request
        
        await connectToDatabase();

        // Validate required fields
        if (!productId || !rating || !comment || !name || !orderId) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return new Response(JSON.stringify({ error: "Rating must be between 1 and 5" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if product exists
        const productExists = await Product.exists({ _id: productId });
        if (!productExists) {
            return new Response(JSON.stringify({ error: "Product not found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        // Check if order exists
        const orderExists = await Order.exists({ _id: orderId });
        if (!orderExists) {
            return new Response(JSON.stringify({ error: "Order not found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        if (rating <= 3) {
            const productName = await Product.findById(productId).select('name');
            if (!productName) {
                return new Response(JSON.stringify({ error: "Product not found" }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const emailContent = generateNegativeReviewAlertEmail({
                customerName: name,
                productName: productName.name,
                rating,
                review: comment,
                orderId
            });
            await sendEmail(process.env.EMAIL_ADDRESS, "Negative Review Alert", emailContent);
            
            return new Response(JSON.stringify({ 
                message: "Review created successfully", 
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let imageUrl = null;
        
        // Process image if it exists
        if (imageFile) {
            // Convert the image file to a buffer
            const imageBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(imageBuffer);
            
            // Upload to Cloudinary
            const uploadResult = await uploadImage(buffer);
            imageUrl = uploadResult.secure_url;
        }



        // Create the review
        const review = new Review({
            productId,
            rating,
            comment,
            name,
            image: imageUrl
        });

        await review.save();


        return new Response(JSON.stringify({ 
            message: "Review created successfully",
            review 
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Failed to create review:", error);
        return new Response(JSON.stringify({ error: "Failed to create review" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
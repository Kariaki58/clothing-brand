import { connectToDatabase } from "@/lib/mongoose";
import Review from "../../../../../models/review";

export async function GET(request, { params }) {
    try {

        const { id } = await params;

        if (!id) {
            return new Response(JSON.stringify({ error: "Missing review ID" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await connectToDatabase();


        const review = await Review.find({productId: id});

        if (!review) {
            return new Response(JSON.stringify({ error: "Review not found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(review), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch review" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
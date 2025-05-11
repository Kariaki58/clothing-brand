import Category from "../../../../models/category";
import { connectToDatabase } from "@/lib/mongoose";


export async function GET(req) {
    try {
        await connectToDatabase();

        const categories = await Category.find()
            .lean();

        return new Response(JSON.stringify(categories), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
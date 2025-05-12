import ReviewForm from "./reviewForm";
import { Suspense } from "react";


export default function ReviewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReviewForm />
        </Suspense>
    );
}
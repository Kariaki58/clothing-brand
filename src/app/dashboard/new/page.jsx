import NewProduct from "./helper-new-product";
import { Suspense } from "react";


export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewProduct />
        </Suspense>
    );
}
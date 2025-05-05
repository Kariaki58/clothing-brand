import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "What is your return policy?",
        answer:
        "We accept returns within 30 days of purchase. Items must be in original condition with tags attached. Please contact our customer service team to initiate a return.",
    },
    {
        question: "How long does shipping take?",
        answer:
        "Standard shipping typically takes 3-5 business days within the continental US. Expedited shipping options are available at checkout.",
    },
    {
        question: "Do you ship internationally?",
        answer:
        "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by destination.",
    },
    {
        question: "What payment methods do you accept?",
        answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay.",
    },
    {
        question: "How can I track my order?",
        answer:
        "Once your order has shipped, you'll receive a confirmation email with tracking information. You can also track your order through our website.",
    },
    {
        question: "What if my item is out of stock?",
        answer:
        "Popular items may sell out quickly. You can sign up for restock notifications on the product page, and we'll email you when it's available again.",
    },
];

export default function FAQPage() {
    return (
        <div className="py-12">
            <div className="container px-4 mx-auto">
                <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h1>
                <p className="text-slate-600 mb-8">
                    Can't find what you're looking for? Contact our customer support team.
                </p>

                <div className="divide-y divide-slate-200">
                    {faqs.map((faq, index) => (
                    <details key={index} className="group py-6">
                        <summary className="flex justify-between items-center cursor-pointer">
                        <h2 className="text-lg font-medium text-slate-900">{faq.question}</h2>
                        <ChevronDown className="h-5 w-5 text-slate-500 group-open:rotate-180 transition-transform" />
                        </summary>
                        <p className="mt-4 text-slate-600">{faq.answer}</p>
                    </details>
                    ))}
                </div>
                </div>
            </div>
        </div>
    );
}
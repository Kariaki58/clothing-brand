"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success("Message sent successfully!");
            setFormData({
                name: "",
                email: "",
                subject: "",
                message: ""
            });
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Contact Us
            </h1>
            <p className="mt-4 text-lg text-gray-600">
            Have questions? We're here to help. Reach out to our team anytime.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                    </label>
                    <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                    </label>
                    <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    />
                </div>
                </div>
                <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                </label>
                <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                />
                </div>
                <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                </label>
                <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message here..."
                    className="min-h-[120px]"
                />
                </div>
                <div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Sending..." : (
                    <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                    </>
                    )}
                </Button>
                </div>
            </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
                <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                    <Mail className="h-5 w-5" />
                    </div>
                    <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">support@example.com</p>
                    <p className="text-gray-600 mt-1">sales@example.com</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <Phone className="h-5 w-5" />
                    </div>
                    <div>
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-600 mt-1">Mon-Fri: 9am-5pm EST</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                    <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                    <h3 className="font-medium text-gray-900">Address</h3>
                    <p className="text-gray-600">123 Commerce Street</p>
                    <p className="text-gray-600">Suite 456</p>
                    <p className="text-gray-600">New York, NY 10001</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                    <Clock className="h-5 w-5" />
                    </div>
                    <div>
                    <h3 className="font-medium text-gray-900">Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
            <div className="bg-white p-4 rounded-lg shadow-md w-full">
                <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215256627166!2d-73.987844924533!3d40.74844097138992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1712345678901"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-md"
                ></iframe>
                </div>
            </div>
        </div>
    );
}
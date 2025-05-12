"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal, Truck, CheckCircle, XCircle, RefreshCw, Package, User, ShoppingCart, CreditCard, Clock } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";


const ITEMS_PER_PAGE = 8;

export default function DashboardOrders() {
    const [allOrders, setAllOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");


    // Fetch orders on component mount
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`/api/orders?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }
                const data = await response.json();
                setAllOrders(data.orders);
                setTotalOrders(data.total);
                setTotalPages(data.totalPages);
                setIsLoading(false);
            } catch (error) {
                toast.error("Failed to load orders");
                setIsLoading(false);
            }
        };
        
        fetchOrders();
    }, [currentPage]);

    const currentOrders = allOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
    
        try {
            const response = await fetch(`/api/orders?query=${searchQuery}`);
            const data = await response.json();

            console.log({ data })
    
            if (data.orders.length > 0) {
                setAllOrders(data.orders);
                setTotalPages(1);
                setCurrentPage(1);
            } else {
                toast.error("Order not found");
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("Failed to fetch search results");
        }
    };
    

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            if (newStatus === "cancelled") {
                setSelectedOrder(allOrders.find(order => order.id === orderId));
                setIsCancelDialogOpen(true);
                return;
            }
            
            // Make API call to update status
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (!response.ok) {
                toast.error("Failed to update order status");
                return
            }
            
            const updatedOrder = await response.json();
            
            // Update local state with the updated order
            setAllOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId 
                    ? updatedOrder 
                    : order
                )
            );
            
            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update order status");
        }
    };

    const confirmCancel = async () => {
        if (!cancelReason.trim()) {
            toast.error("Please provide a cancellation reason");
            return;
        }

        try {
            const orderId = selectedOrder.id;
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    status: "cancelled",
                    cancellationReason: cancelReason
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to cancel order');
            }
            
            const updatedOrder = await response.json();
            
            // Update local state with the cancelled order
            setAllOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId 
                    ? updatedOrder 
                    : order
                )
            );
            
            toast.success("Order cancelled successfully");
            setIsCancelDialogOpen(false);
            setCancelReason("");
        } catch (error) {
            toast.error("Failed to cancel order");
        }
    };

    const showOrderDetails = (orderId) => {
        setSelectedOrder(allOrders.find(order => order.id === orderId));
        setIsDetailsDialogOpen(true);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
            case "processing":
                return <Badge variant="secondary" className="bg-purple-100 text-purple-800"><RefreshCw className="h-3 w-3 mr-1" /> Processing</Badge>;
            case "shipped":
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Truck className="h-3 w-3 mr-1" /> Shipped</Badge>;
            case "delivered":
                return <Badge variant="secondary" className="bg-green-100 text-green-800"><Package className="h-3 w-3 mr-1" /> Delivered</Badge>;
            case "cancelled":
                return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    // Generate pagination items with ellipsis logic
    const getPaginationItems = () => {
        const items = [];
        const maxVisiblePages = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;

        // Always show first page
        items.push(1);

        // Show ellipsis if current page is far from start
        if (currentPage > maxVisiblePages - 1) {
            items.push('...');
        }

        // Calculate start and end of visible page range
        let start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
        let end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

        // Adjust if we're near the end
        if (end === totalPages - 1) {
            start = Math.max(2, totalPages - maxVisiblePages + 1);
        }

        // Add visible page numbers
        for (let i = start; i <= end; i++) {
            if (i > 1 && i < totalPages) {
                items.push(i);
            }
        }

        // Show ellipsis if current page is far from end
        if (currentPage < totalPages - (maxVisiblePages - 2)) {
            items.push('...');
        }

        // Always show last page if there's more than one page
        if (totalPages > 1) {
            items.push(totalPages);
        }

        return items;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
        );
    }


    return (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold">Orders</h1>
            {/* input to find order by orderId */}
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Order ID"
                    className="border rounded-md px-2 py-1"
                />
                <Button onClick={handleSearch} variant="outline" size="sm">Search</Button>
            </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[120px]">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {currentOrders.map((order) => (
                <TableRow key={order.id}>
                    <TableCell className="font-medium">{`#${order.id.toString().substring(0, 4)}`}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell className="hidden sm:table-cell">{order.date}</TableCell>
                    <TableCell className="text-right">${order.total}</TableCell>
                    <TableCell>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        {order.status === "cancelled" && order.cancellationReason && (
                        <span className="text-xs text-muted-foreground hidden md:inline">
                            ({order.cancellationReason})
                        </span>
                        )}
                    </div>
                    </TableCell>
                    <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => showOrderDetails(order.id)}>
                            View Details
                        </DropdownMenuItem>
                        <div className="px-2 py-1.5">
                            <Select 
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                            >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancel Order</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <div className="text-sm text-muted-foreground">
            Showing{" "}
            <strong>
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, allOrders.length)}
            </strong>{" "}
            of <strong>{allOrders.length}</strong> orders
            </div>
            
            <div className="flex items-center gap-1">
            <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="hidden sm:inline-flex"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
                {getPaginationItems().map((item, index) => (
                item === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 py-1">...</span>
                ) : (
                    <Button
                    key={item}
                    variant={currentPage === item ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(item)}
                    className="min-w-[2.5rem]"
                    >
                    {item}
                    </Button>
                )
                ))}
            </div>
            
            <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="hidden sm:inline-flex"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Mobile navigation */}
            <div className="flex sm:hidden gap-2">
                <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                >
                <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                >
                <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            </div>
        </div>

        {/* Cancel Order Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={(open) => {
            if (!open) setCancelReason("");
            setIsCancelDialogOpen(open);
        }}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Cancel Order {selectedOrder?.id}</DialogTitle>
                <DialogDescription>
                Please provide a reason for cancelling this order. This will be communicated to the customer.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                <Textarea
                    id="reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation (e.g., out of stock, customer request)"
                    className="min-h-[100px]"
                />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => {
                setCancelReason("");
                setIsCancelDialogOpen(false);
                }}>
                Back
                </Button>
                <Button 
                variant="destructive" 
                onClick={confirmCancel}
                disabled={!cancelReason.trim()}
                >
                Confirm Cancellation
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Order Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="sticky top-0 bg-background z-10">
                <DialogTitle>Order Details - {`#${selectedOrder?.id.toString().substring(0, 4)}`}</DialogTitle>
                <DialogDescription>
                Order placed on {selectedOrder?.date}
                </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
                <div className="grid gap-6 py-4">
                {/* Customer Information */}
                <div className="border rounded-lg p-4">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                    <User className="h-4 w-4" /> Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p>{selectedOrder.customer}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{selectedOrder.customerDetails.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p>{selectedOrder.customerDetails.phone}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Shipping Address</p>
                        <p>{selectedOrder.customerDetails.address}</p>
                    </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="border rounded-lg p-4">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                    <ShoppingCart className="h-4 w-4" /> Order Items
                    </h3>
                    <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center border-b pb-2">
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                <p className="text-sm text-muted-foreground">Color: {item.color}</p>
                                <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                                <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="object-cover object-center h-full w-full"
                                    />
                                </div>
                            </div>
                            <p>${item.price}</p>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Payment & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                        <CreditCard className="h-4 w-4" /> Payment Information
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">Method</p>
                        <p>{selectedOrder.paymentMethod}</p>
                        </div>
                        <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                            Paid
                        </Badge>
                        </div>
                    </div>
                    </div>

                    <div className="border rounded-lg p-4">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4" /> Order Summary
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">Subtotal</p>
                        <p>${selectedOrder.subtotal}</p>
                        </div>
                        <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">Shipping</p>
                        <p>${selectedOrder.shipping}</p>
                        </div>
                        <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">Tax</p>
                        <p>${selectedOrder.tax}</p>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t">
                        <p>Total</p>
                        <p>${selectedOrder.total}</p>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            )}
            </DialogContent>
        </Dialog>
        </div>
    );
}
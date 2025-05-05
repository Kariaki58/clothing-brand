import Sidebar from "./sidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="py-8">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <Sidebar />
                    <div className="lg:col-span-3">
                        <div className="bg-white border border-slate-200 rounded-lg p-6">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
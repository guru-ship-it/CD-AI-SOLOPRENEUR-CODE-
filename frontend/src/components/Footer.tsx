
import { Logo } from './Logo';

export const Footer = () => {
    return (
        <footer className="bg-slate-900 border-t border-slate-800">
            <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
                <div className="md:flex md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <a href="#" className="flex items-center">
                            <Logo />
                        </a>
                        <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-sm">
                            Compliance Desk AI LLP is a registered Data Fiduciary under the Digital Personal Data Protection Act, 2023.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-white uppercase">Resources</h2>
                            <ul className="text-gray-400 font-medium">
                                <li className="mb-4">
                                    <a href="#" className="hover:text-emerald-500 transition-colors">Documentation</a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-emerald-500 transition-colors">API Reference</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-white uppercase">Legal</h2>
                            <ul className="text-gray-400 font-medium">
                                <li className="mb-4">
                                    <a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-white uppercase">Contact</h2>
                            <ul className="text-gray-400 font-medium">
                                <li className="mb-4">
                                    <span className="block font-semibold text-white">Grievance Officer:</span>
                                    <span>Mr. Vijay Lawyer</span>
                                </li>
                                <li>
                                    <span className="block font-semibold text-white">Address:</span>
                                    <span>Madhapur, Hyderabad</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-slate-800 sm:mx-auto lg:my-8" />
                <div className="sm:flex sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-400 sm:text-center">© 2025 <a href="#" className="hover:underline">ComplianceDesk.ai™</a>. All Rights Reserved.
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-gray-400">System Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

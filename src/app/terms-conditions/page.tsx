import Link from 'next/link'
import React from 'react'

const TermsConditionsPage = () => {
    return (
        <div className='page-container'>
            <h1 className="text-3xl font-bold mb-2 text-center mt-4">Terms & Conditions</h1>
            <p className="text-sm text-gray-500 mb-6 text-center">Last updated: June 2025</p>

            <ol className="space-y-7">
                <li>
                    <h2 className="text-xl font-semibold mb-1">1. Introduction</h2>
                    <p className="text-base text-gray-400">
                        Welcome to <span className="font-semibold">Buckwise</span>. Buckwise is a money management platform that allows users to track their dues and manage financial connections with others. By accessing or using Buckwise, you agree to comply with and be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use the platform.
                    </p>
                </li>
                <li>
                    <h2 className="text-xl font-semibold mb-1">2. User Accounts</h2>
                    <p className="text-base text-gray-400">
                        To use Buckwise, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 text-gray-400 space-y-1">
                        <li>You must be at least <span className="font-semibold">18 years old</span> to create an account on Buckwise.</li>
                        <li>You may not use another person’s account without permission.</li>
                        <li>Buckwise reserves the right to suspend or terminate your account if any information provided is found to be inaccurate, false, or misleading.</li>
                    </ul>
                </li>
                <li>
                    <h2 className="text-xl font-semibold mb-1">3. Service Description</h2>
                    <p className="text-base text-gray-400">
                        Buckwise enables users to create connections with other users and track financial dues between them. The platform provides tools to record, view, and manage these dues, but does not facilitate actual money transfers. All financial transactions must be settled outside of Buckwise.
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 text-gray-400 space-y-1">
                        <li>Buckwise does not act as a payment processor or intermediary for any financial transactions.</li>
                        <li>The platform is intended solely for tracking and record-keeping purposes.</li>
                    </ul>
                </li>
                <li>
                    <h2 className="text-xl font-semibold mb-1">4. User Responsibilities</h2>
                    <ul className="list-disc list-inside ml-4 text-gray-400 space-y-1">
                        <li>Provide accurate and up-to-date information when creating connections and recording dues.</li>
                        <li>Use Buckwise only for lawful purposes and in accordance with these Terms.</li>
                        <li>Respect the privacy and rights of other users.</li>
                        <li>Do not use Buckwise to harass, threaten, or defraud others.</li>
                        <li>Do not attempt to gain unauthorized access to other users’ accounts or data.</li>
                    </ul>
                </li>
                <li>
                    <h2 className="text-xl font-semibold mb-1">5. Data and Privacy</h2>
                    <p className="text-base text-gray-400">
                        Buckwise values your privacy. Please review our <Link href="/privacy-policy" className="text-blue-400">Privacy Policy</Link> to understand how we collect, use, and protect your information. By using Buckwise, you consent to the collection and use of your information as described in the Privacy Policy.
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 text-gray-400 space-y-1">
                        <li>Your data is stored securely and is not shared with third parties except as required by law or as necessary to provide the service.</li>
                        <li>You have the right to request access to or deletion of your personal data at any time.</li>
                    </ul>
                </li>
                <li>
                    <h2 className="text-xl font-semibold mb-1">6. Intellectual Property</h2>
                    <p className="text-base text-gray-400">
                        All content, features, and functionality on Buckwise, including but not limited to text, graphics, logos, and software, are the exclusive property of Buckwise or its licensors. You may not copy, modify, distribute, or create derivative works based on any part of the platform without our express written permission.
                    </p>
                </li>
                <li>
                    <h2 className="text-xl font-semibold mb-1">7. Limitation of Liability</h2>
                    <p className="text-base text-gray-400">
                        Buckwise is a tracking tool and does not guarantee the accuracy of user-entered data or the fulfillment of any financial obligations between users. Buckwise is not responsible for any disputes or losses arising from the use of the platform. You use Buckwise at your own risk.
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 text-gray-400 space-y-1">
                        <li>Buckwise is provided <span className="italic">“as is”</span> and <span className="italic">“as available”</span> without warranties of any kind.</li>
                        <li>We do not warrant that the platform will be error-free, secure, or uninterrupted.</li>
                        <li>In no event shall Buckwise or its affiliates be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the platform.</li>
                    </ul>
                </li>
                <li>
                    <h2 className="text-xl font-semibold mb-1">8. Termination</h2>
                    <p className="text-base text-gray-400">
                        We reserve the right to suspend or terminate your access to Buckwise at any time, without notice, for conduct that we believe violates these Terms and Conditions or is harmful to other users or the platform.
                    </p>
                </li>
                <li>
                    <h2 className="text-xl font-semibold mb-1">9. Changes to Terms</h2>
                    <p className="text-base text-gray-400">
                        Buckwise reserves the right to update these Terms and Conditions at any time. We will notify users of any material changes by posting the new terms on this page. Continued use of the platform after changes constitutes acceptance of the new terms.
                    </p>
                </li>
                <li>
                    <h2 className="text-xl font-semibold mb-1">10. Governing Law</h2>
                    <p className="text-base text-gray-400">
                        These Terms and Conditions are governed by and construed in accordance with the laws of your jurisdiction. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in your jurisdiction.
                    </p>
                </li>
                <li>
                    <h2 className="text-xl font-semibold mb-1">11. Contact Us</h2>
                    <p className="text-base text-gray-400">
                        If you have any questions about these Terms and Conditions, please contact us at <a href="mailto:support@buckwise.com" className="text-blue-400">support@buckwise.com</a>.
                    </p>
                </li>
            </ol>

            <p className='text-center text-gray-500 text-[0.9rem] mt-7 mb-3'>
                &copy; {new Date().getFullYear()} Buckwise
                <span><i className="bi bi-dot"></i></span>
                <Link href={'/privacy-policy'}>Privacy policy</Link>
                <span><i className="bi bi-dot"></i></span>
                <Link href={'/terms-conditions'}>Terms & conditions</Link>
            </p>
        </div>
    )
}

export default TermsConditionsPage
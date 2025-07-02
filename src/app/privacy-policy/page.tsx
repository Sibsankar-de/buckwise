import Link from 'next/link'
import React from 'react'

const PrivacyPolicyPage = () => {
    return (
        <div className="page-container">
            <h1 className="text-3xl font-bold mb-3 text-center mt-4">Privacy Policy</h1>
            <p className="text-sm text-gray-500 mb-6 text-center">
                <strong className="font-semibold">Last updated:</strong> June 2025
            </p>
            <p className="mb-6 text-base text-gray-400">
                Welcome to <span className="font-semibold">Buckwise</span>! Your privacy is important to us. This Privacy Policy explains how Buckwise collects, uses, and protects your information when you use our money management platform to track dues and manage connections with others.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">Information We Collect</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-400 mb-6">
                <li>
                    <span className="font-semibold">Account Information:</span> When you create an account, we collect your name, email address, and password.
                </li>
                <li>
                    <span className="font-semibold">Connection Data:</span> To help you track dues, we collect information about your connections with other users, including names and email addresses you provide.
                </li>
                <li>
                    <span className="font-semibold">Transaction Data:</span> We store details about dues, payments, and related notes you enter on Buckwise.
                </li>
                <li>
                    <span className="font-semibold">Usage Data:</span> We collect information about how you use Buckwise, such as pages visited, features used, device information, browser type, IP address, and access times, to improve our service and ensure security.
                </li>
                <li>
                    <span className="font-semibold">Cookies and Tracking Technologies:</span> We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze usage patterns.
                </li>
                <li>
                    <span className="font-semibold">Support and Communication Data:</span> If you contact us for support or feedback, we may collect information related to your inquiry, including your contact details and the content of your communication.
                </li>
            </ol>

            <h2 className="text-xl font-semibold mt-8 mb-3">How We Use Your Information</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-400 mb-6">
                <li>To provide, operate, and maintain the Buckwise service.</li>
                <li>To help you track dues, manage connections, and facilitate payments.</li>
                <li>To communicate with you about your account, updates, security alerts, and administrative messages.</li>
                <li>To personalize your experience and recommend features or content.</li>
                <li>To analyze usage and trends to improve our platform and develop new features.</li>
                <li>To detect, prevent, and address technical issues, fraud, or security threats.</li>
                <li>To comply with legal obligations and enforce our terms and policies.</li>
            </ol>

            <h2 className="text-xl font-semibold mt-8 mb-3">Information Sharing</h2>
            <p className="mb-2 text-base text-gray-400">
                We do not sell or rent your personal information. We only share your information:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-400 mb-6">
                <li>With your connections, as needed to track dues and payments.</li>
                <li>With service providers who help us operate Buckwise (e.g., hosting, analytics, customer support), under strict confidentiality agreements.</li>
                <li>With legal authorities when required by law, regulation, or legal process, or to protect Buckwise’s rights, property, or safety, or that of our users or the public.</li>
                <li>In connection with a merger, acquisition, or sale of all or a portion of our assets, with notice to you before your information is transferred and becomes subject to a different privacy policy.</li>
            </ol>

            <h2 className="text-xl font-semibold mt-8 mb-3">Data Retention</h2>
            <p className="mb-6 text-base text-gray-400">
                We retain your personal information for as long as your account is active or as needed to provide you with our services. We may also retain and use your information to comply with our legal obligations, resolve disputes, and enforce our agreements. When your information is no longer needed, we will securely delete or anonymize it.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">Data Security</h2>
            <p className="mb-6 text-base text-gray-400">
                We use industry-standard security measures, such as encryption, secure servers, and access controls, to protect your data. However, no method of transmission over the Internet or electronic storage is 100% secure. We encourage you to use strong passwords and protect your account information.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">Your Rights and Choices</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-400 mb-6">
                <li>You can update or delete your account information at any time from your account settings.</li>
                <li>You can remove connections and transaction data as needed.</li>
                <li>You can opt out of non-essential communications by updating your notification preferences.</li>
                <li>You may request access to, correction of, or deletion of your personal data by contacting us.</li>
                <li>Depending on your location, you may have additional rights under applicable data protection laws.</li>
            </ol>

            <h2 className="text-xl font-semibold mt-8 mb-3">Children’s Privacy</h2>
            <p className="mb-6 text-base text-gray-400">
                Buckwise is not intended for use by children under the age of 16. We do not knowingly collect personal information from children under 16. If you believe we have collected such information, please contact us so we can take appropriate action.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">International Data Transfers</h2>
            <p className="mb-6 text-base text-gray-400">
                Buckwise is operated from servers located in various countries. Your information may be transferred to, stored, and processed in countries outside your own. We take steps to ensure your data is protected in accordance with this Privacy Policy and applicable laws.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">Changes to This Policy</h2>
            <p className="mb-6 text-base text-gray-400">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
            <p className="mb-6 text-base text-gray-400">
                If you have any questions about this Privacy Policy, your data, or your rights, please contact us at <a href="mailto:support@buckwise.com" className="text-blue-400">support@buckwise.com</a>.
            </p>

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

export default PrivacyPolicyPage